import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';
import { inspectionFixture } from './inspectionFixture';

async function isolatedService(file: string, mock: Record<string, unknown>) {
  const result = await build({
    entryPoints: [file], bundle: true, write: false, platform: 'node', format: 'cjs',
    plugins: [{ name: 'firebase-fixture', setup(builder) {
      builder.onResolve({ filter: /^firebase\/|^\.\/client$/ }, () => ({ path: 'firebase', namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
        contents: `const mock=globalThis.__firebaseFixture; ${Object.keys(mock).map(key => `export const ${key}=mock.${key};`).join('\n')}`,
      }));
    } }],
  });
  const isolatedGlobal = { __firebaseFixture: mock };
  const module = { exports: {} as Record<string, any> };
  new Function('module', 'exports', 'globalThis', result.outputFiles[0].text)(module, module.exports, isolatedGlobal);
  return module.exports;
}

test('inspection persistence retains collection, fields, defaults and serialization', async () => {
  const writes: any[][] = [];
  const mock = {
    db: {}, auth: { currentUser: null },
    doc: (_db: unknown, collection: string, id: string) => ({ collection, id }),
    setDoc: async (...args: any[]) => { writes.push(args); },
    collection() {}, getDoc() {}, getDocs() {}, query() {}, where() {}, updateDoc() {}, deleteDoc() {}, onSnapshot() {},
  };
  const { inspectionService } = await isolatedService('src/services/firebase/inspectionService.ts', mock);
  const inspection = inspectionFixture({ season: undefined });
  await inspectionService.saveInspection(inspection);
  assert.deepEqual(writes[0][0], { collection: 'inspections', id: inspection.id });
  const saved = writes[0][1];
  assert.equal(saved.certificateRef, 'GLOULT16062026');
  assert.equal(saved.fabricConstruction.gsm, 150);
  assert.equal(saved.pointsPer100Yds, inspection.pointsPer100Yds);
  assert.deepEqual(saved.rolls, inspection.rolls);
  assert.equal('season' in saved, false);
  assert.ok(saved.updatedAt);
  assert.equal(writes[0].length, 2);
});

test('account resolution preserves signup, admin rejection and role selection', async () => {
  const oldStorage = globalThis.localStorage;
  const oldWindow = globalThis.window;
  const values = new Map<string, string>();
  const writes: any[][] = [];
  let existing: any = null;
  let signOutCount = 0;
  const firebaseUser = { uid: 'user-1', displayName: 'New Inspector', email: 'user@example.test', photoURL: '' };
  try {
    globalThis.localStorage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } as unknown as Storage;
    globalThis.window = { dispatchEvent: () => true } as unknown as Window & typeof globalThis;
    const { resolveUser, AdminAccessDeniedError } = await isolatedService('src/services/firebase/accountService.ts', {
      db: {}, auth: { signOut: async () => { signOutCount++; } },
      doc: (_db: unknown, collection: string, id: string) => ({ collection, id }),
      getDoc: async () => ({ exists: () => Boolean(existing), data: () => existing }),
      setDoc: async (...args: any[]) => { writes.push(args); },
    });
    await assert.rejects(resolveUser(firebaseUser), AdminAccessDeniedError);
    assert.match(values.get('tex-inspect-login-error')!, /first-time signup/);
    assert.equal(writes.length, 0);
    values.set('tex-inspect-login-mode', 'SIGN_UP');
    const created = await resolveUser(firebaseUser);
    assert.equal(created.role, 'INSPECTOR');
    assert.deepEqual(writes[0][0], { collection: 'users', id: 'user-1' });
    assert.equal(writes[0][1].role, 'INSPECTOR');
    assert.equal(values.get('tex-inspect-login-mode'), 'SIGN_IN');
    existing = created;
    values.set('tex-inspect-login-role', 'ADMIN');
    await assert.rejects(resolveUser(firebaseUser), AdminAccessDeniedError);
    assert.equal(values.get('tex-inspect-login-role'), 'INSPECTOR');
    assert.equal(signOutCount, 2);
    existing = { ...created, role: 'ADMIN', name: 'Stored Name' };
    values.set('tex-inspect-login-role', 'ADMIN');
    assert.equal((await resolveUser(firebaseUser)).role, 'ADMIN');
    values.set('tex-inspect-login-role', 'INSPECTOR');
    assert.equal((await resolveUser(firebaseUser)).role, 'INSPECTOR');
    assert.equal((await resolveUser(firebaseUser)).name, 'Stored Name');
    assert.equal(writes.length, 1);
  } finally {
    globalThis.localStorage = oldStorage;
    globalThis.window = oldWindow;
  }
});

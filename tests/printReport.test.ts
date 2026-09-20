import assert from 'node:assert/strict';
import test from 'node:test';
import { printReport } from '../src/features/reports/printReport';

test('printing preserves the A4 document, styles, images and popup lifecycle', async () => {
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  const oldFetch = globalThis.fetch;
  const events: string[] = [];
  let html = '';
  let onLoad: () => void;
  const popup = {
    addEventListener(_name: string, callback: () => void) { onLoad = callback; },
    document: {
      open() { events.push('open'); },
      write(value: string) { html = value; },
      close() { onLoad(); },
      fonts: { ready: Promise.resolve() },
      images: [{ decode: async () => { events.push('image-ready'); } }],
    },
    focus() { events.push('focus'); },
    print() { events.push('print'); },
    close() { events.push('close'); },
  };
  try {
    globalThis.document = {
      fonts: { ready: Promise.resolve() },
      querySelectorAll: (selector: string) => selector === 'style'
        ? [{ outerHTML: '<style>.existing { color: red; }</style>' }]
        : [{ href: 'https://example.test/app.css', outerHTML: '<link rel="stylesheet" href="app.css">' }],
    } as unknown as Document;
    globalThis.window = {
      location: { origin: 'https://example.test' },
      open: () => popup,
      setTimeout: (callback: () => void) => { callback(); return 1; },
    } as unknown as Window & typeof globalThis;
    globalThis.fetch = async () => new Response('.report-document { color: black; }');
    await printReport({ outerHTML: '<div id="report-content"><table><tr><td>All data</td></tr></table></div>' } as HTMLDivElement);
    assert.match(html, /size: A4/);
    assert.match(html, /margin: 10mm/);
    assert.match(html, /width: 190mm/);
    assert.match(html, /All data/);
    assert.match(html, /existing \{ color: red/);
    assert.match(html, /report-document \{ color: black/);
    assert.deepEqual(events, ['open', 'image-ready', 'focus', 'print', 'close']);
  } finally {
    globalThis.window = oldWindow;
    globalThis.document = oldDocument;
    globalThis.fetch = oldFetch;
  }
});

test('blocked print popup retains the browser print fallback', async () => {
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  let printed = false;
  try {
    globalThis.document = { fonts: { ready: Promise.resolve() } } as unknown as Document;
    globalThis.window = { open: () => null, print: () => { printed = true; } } as unknown as Window & typeof globalThis;
    await printReport({ outerHTML: '<div>Report</div>' } as HTMLDivElement);
    assert.equal(printed, true);
  } finally {
    globalThis.window = oldWindow;
    globalThis.document = oldDocument;
  }
});

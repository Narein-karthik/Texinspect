# TexInspect Source Guide

TexInspect uses React, TypeScript, Vite, React Router, Zustand with IndexedDB
persistence, Firebase Authentication, and Firestore. The public contact endpoint
is a Vercel function. This refactor reorganizes the existing implementation; it
does not introduce a new framework, router, database schema, or design system.

## Where to Work

| Area | Location | Responsibility |
| --- | --- | --- |
| Startup and routes | `src/main.tsx`, `src/App.tsx` | Provider mounting, existing routes and route transitions |
| Page composition | `src/pages/` | Dashboard, login, home, contact, profile, inspection and reports screens |
| Auth | `src/features/auth/` | Auth listener, inspection subscriptions, login state and storage keys |
| Shared layout | `src/components/layout/` | App header, navigation, layout and sync status bar |
| Common controls | `src/components/common/` | Speech input button, including existing Capacitor support |
| Inspection workflow | `src/features/inspections/` | Creation state, roll/defect logging, measurements and workflow calculations |
| Inspection forms | `src/features/inspections/components/` | Five creation steps, roll selection, timeline and roll/defect dialogs |
| Report workflow | `src/features/reports/` | Report editing, list filters, data preparation and PDF printing |
| Report UI | `src/features/reports/components/` | Document pages, editor sections, report tables, evidence and list components |
| Analytics | `src/features/analytics/` | Dashboard aggregation, defect summaries and Recharts trend chart |
| Dashboard UI | `src/features/dashboard/` | Separate admin monitor and inspector dashboard |
| Profile | `src/features/profile/` | Profile editing state and save coordination |
| Public site | `src/features/public-site/` | Shared branding and public navigation |
| Browser hooks | `src/hooks/` | Display mode, network status and pull-to-refresh |
| Firebase | `src/services/firebase/` | Client initialization, account resolution, profile writes and inspection CRUD/subscriptions |
| Contact client | `src/services/api/contactService.ts` | Existing `/api/contact` request and response contract |
| Contact backend | `api/contact.js` | Existing Firestore Admin and email integration; remains a server-only Vercel function |
| State and offline storage | `src/store.ts` | Existing Zustand actions, IndexedDB persistence and sync behavior |
| Shared types | `src/types/` | Inspection, account and store contracts; `index.ts` exports the public types |
| Shared definitions | `src/constants/` | Fabric fields, units, defect types and quality checkpoints |
| Utilities | `src/utils/` | Certificate references, fabric defaults, measurements, image compression and class names |
| Styles and assets | `src/index.css`, `src/assets/` | Existing styles, print rules and images |

## Existing Routes

Authenticated routes remain `/`, `/new`, `/profile`, `/reports`,
`/inspection/:id`, and `/reports/:id`. The layout still selects the public home,
contact or combined login/signup screen for unauthenticated visitors, including
the existing `/login` and `/contact` handling. No separate registration route or
new authentication redirect was added.

## Data Flow

`AuthProvider` listens for Firebase authentication, resolves the stored account,
and subscribes to inspections through `inspectionService`. Admins retain the
all-inspections subscription; inspectors retain their existing filtered query.
The Zustand store remains the shared source of inspection state.

Page components compose feature components. Feature hooks coordinate local form
state and store actions. Firebase SDK reads/writes belong in the Firebase
services. The contact page validates its form and delegates the existing request
to `contactService`.

The creation hook owns form state across all five steps. Finishing an inspection
still marks it completed and navigates to `/reports/:id?edit=final`. The report
editor still opens from that query, edits a cloned draft, and submits the same
update fields through the store.

`buildReportData` prepares existing report values and defaults. `buildReportEdits`
prepares the existing save payload and recalculates the report. `ReportDocument`
composes the printable sections. `printReport` handles the existing popup,
stylesheets, fonts, image decoding, A4 print settings and browser-print fallback.

## Compatibility Constraints

- Keep Firestore collections, document fields, role strings and storage keys as
  they are. The `users`, `inspections` and backend `walkthrough_requests`
  collections have not changed.
- `lengthYards` and `pointsPer100Yds` are legacy stored field names. The current
  calculations use meters despite those names. Renaming them requires a separate
  migration, not a source cleanup.
- Inspection logging currently uses the first roll's width for scoring. Report
  editing uses length-weighted width. Both existing formulas are intentionally
  preserved and covered by regression tests.
- Existing verdict overrides, absent-field defaults, number formatting, image
  processing settings and report table output are preserved.
- Hidden legacy report sections remain in the document so this refactor does not
  remove existing markup or alter print behavior.
- Keep animation keys, conditional form mounting, document IDs, Tailwind class
  strings and print rules when moving UI code.
- Do not move Firebase Admin or email credentials into browser modules.

## Verification

```sh
npm test
npm run lint
npm run build
npm run dev
```

`lint` runs TypeScript checking. Generated `dist` files are excluded from that
check. Tests use the existing `tsx`
dependency and Node's built-in test runner. They cover calculations, legacy data,
report edits, Firebase contracts with mocks, and the print service lifecycle.

No dependency versions, Firebase rules, environment variables, deployment
rewrites or backend function behavior were changed. Real Google sign-in,
production Firestore access, and native-device speech permissions still need
their usual authenticated/device smoke tests before deployment.

## Refactor Verification Record

- TypeScript checking and production builds passed after the major extraction
  stages. The existing bundle-size warning remains.
- 84 before/after server-rendered markup comparisons passed, covering inspector
  and admin views, empty reports, legacy defaults, verdicts, fabric types, and UOMs.
- Browser comparisons at 390px and 1440px preserved form-step state, roll/defect
  logging, finish-report navigation, quantity edits, defect-type edits and saved
  inspection values.
- Report screen and print-media screenshots matched the original at both widths.
- Firebase and print-service tests use mocks; no production records were changed.
- The profile name editor closed immediately in both the original and refactored
  browser tests. That existing behavior was deliberately not changed here.
- Native Save as PDF dialog completion was not automated. Headless PDF export
  failed in the local Windows browser; print markup, A4 settings and print-media
  screenshots were checked instead.

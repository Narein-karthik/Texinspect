# Security Specification

## Data Invariants
1. An inspection must have a valid `inspectorId` matching the authenticated user's UID.
2. An inspection `status` cannot be changed to `SYNCED` by the client (this is managed by the server/sync logic internally, although here the client sets it after successful write). Actually, for this app, the client sets `syncStatus` to `SYNCED`.
3. `isPass` and `pointsPer100Yds` must be calculated correctly based on rolls and defects (though rules only check types/presence).

## The "Dirty Dozen" Payloads
1. Create inspection with someone else's `inspectorId`.
2. Update inspection `pointsPer100Yds` to a massive negative number.
3. Inject a 1MB string into `customerName`.
4. Delete an inspection belonging to another user.
5. List all inspections in the system without filtering by `inspectorId`.
6. Create an inspection without any rolls.
7. Update an inspection's `inspectionDate` to a future date.
8. Add a defect with `severity` 10 (valid range 1-4).
9. Change `inspectorName` to simulate identity spoofing.
10. Read user profile of another employee.
11. Write a 1MB Base64 string into a defect's `comment` field.
12. Create an inspection as an unauthenticated user.

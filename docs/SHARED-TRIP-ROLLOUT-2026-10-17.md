# Shared-trip rollout — 17 October 2026

The owner changed the requirement from manual snapshot transfer to one canonical trip visible to everyone. They selected restricted editing and explicitly named exactly two editor accounts. Those addresses are stored only in the Sites runtime allowlist, not source or browser code.

## Architecture

- Managed Sites app: https://japan-2026-shared-plan.ugurcanuyumaz.chatgpt.site/
- Persisted project ID: appgprj_6ad329d091a881919e32bc286fcf9b04. Source checkout: shared-site/. The root GitHub Pages site forwards to it and preserves query/hash.
- Public GET /api/shared-trip returns canonical choices, saved resources/ideas and handled task progress; no-store and no database mutation on read. The initial document is the published empty personal-choice state, matching the browser baseline verified before rollout.
- PUT requires platform-authenticated identity matching PLANNER_EDITOR_EMAILS, same-origin JSON, valid complete state and a matching integer revision. Anonymous/unlisted writes are rejected. SQL compare-and-swap rejects stale writes with 409 and latest state.
- Clients poll every eight seconds while visible and on focus. Successful writes persist to D1. A dirty local draft is retained on network failure; later revisions trigger explicit conflict review. Old browser data never automatically overwrites shared data.
- Global edit controls are disabled for viewers, loading/saving/conflict states. Viewing, maps, filters, downloads and day links remain available. Backups explicitly describe replacing the shared trip for everyone. Shared links point at the live trip; older snapshots require reviewed restore by an editor.
- External revisions clear old Undo snapshots to avoid restoring over another editor's later change.

## Verification

155 automated checks in 24 files passed, including six API authorization/revision tests and three shared-client validation tests. TypeScript and production build passed. Generated migration is schema-only. The Sites source helper committed and pushed exact source; Windows packaging used the official build-output validator followed by a tar archive because the bundled shell packager requires unavailable Bash.

Managed deployment succeeded with runtime environment revision 1. Public live API returned 200, revision 0 and empty canonical choices/saves/progress; anonymous PUT was rejected with 401. The browser loaded the shared planner with no console errors, displayed view-only status, disabled Save controls and produced a live shared day link. No database decision was changed during these checks. The connected ChatGPT account uses a different email from the requested allowlist, so an allowed-account browser editing test needs one of the two named accounts to sign in. No third editor account was added.

## Limits

Changes appear after successful server save, normally within eight seconds on open viewer pages; network failure is shown explicitly. This is polling, not a real-time socket. Static itinerary/research edits still require deployment. Quick/full view and browsing filters are device preferences. HTML/JSON exports are snapshots and do not update themselves.

## Simple editor sign-in — version 3

The owner explicitly requested a simple email-and-password form for the existing two editor emails. ChatGPT sign-in was replaced for trip editing; platform Site ownership and public viewing access are unchanged.

The password is stored only as a salted PBKDF2 hash in runtime PLANNER_PASSWORD_HASH. AUTH_RATE_LIMIT_KEY protects IP/email rate keys. Opaque 32-byte session tokens are hashed in D1, expire after seven days and are issued in Secure, HttpOnly, SameSite=Strict cookies. Logout revokes the server session. The additive migration creates editor_session and login_attempt tables, preserving shared_trip.

162 checks in 26 files passed, with real WebCrypto hash validation, expired/revoked/unlisted session checks, rate limits and revision conflicts. TypeScript and production build passed. Version 3 deployed successfully with environment revision 2.

Live checks passed: incorrect password rejected; both approved emails signed in using the requested password; an unapproved email was rejected with that same password; sign-out restored view-only mode; session and a saved workshop survived reload. A second open page received the second account's edit through automatic refresh. Original choices, saved ideas and task progress were verified against the pre-test backup and restored exactly. No reservations or source-confirmed statuses were changed.

The sign-in dialog supports native form validation, mobile-sized inputs, keyboard wrapping and Escape; no password is kept in browser storage or source code. Runtime login secrets and allowed email values are intentionally omitted from this document.

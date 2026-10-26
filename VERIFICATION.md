# Verification record — 2026-10-25

- 9 automated tests pass: numeric statistics, all-point pass/fail, missing limits, bad/missing/non-finite data, duplicate time, mV conversion, import schema, escaped SVG text, parent-directory .env lookup, cross-origin requests, missing-key errors, provider request/usage mapping.
- Browser: overview renders; independent synthetic project opens; comparison displays correct mean, peak-to-peak and standard deviation differences; revision V1 saves and working revision advances to V2.
- Browser CSV upload of examples/synthetic-output.csv: 5 samples, selected mV, target 10 V ± 0.05 V; mean 10 V, full-window peak-to-peak 0.04 V, all 5 samples in range. Saved with design snapshot.
- Live course provider smoke test: gpt-6-luna returned text and usage (248 input, 277 output); no user project payload sent.
- Live public web-search test through course provider: searched TI TPS22919 official page, returned https://www.ti.com/product/TPS22919 and 5.5 V input operating maximum. One completed web search; usage 7970 input, 166 output. This is a connectivity test, not a selected part or project recommendation.
- Actual user measurement validation is pending; no user's test results have been supplied.
- Pin-level schematic generation, ERC/SPICE, instruments and PDF/image parsing are not implemented.

## English and interaction update — 2026-10-26

- Converted application copy, validation errors, exports, AI response instructions, comments, and README to English.
- Scanned the source and generated deployment bundle for Han-script characters; none remain.
- Checked all seven workspace pages in the browser; their built-in copy is English and no browser errors were reported.
- Verified the migration of the old default project into English while preserving IDs and raw data; repeated migration is idempotent.
- Increased body text from 14 px to 16 px, strengthened headings and controls, and widened the navigation rail.
- Added hover elevation, press response, subtle pointer feedback, page/dialog transitions, saving indicators, and reduced-motion support.
- Existing nine automated tests pass. This update did not send any project data to a model provider.

## Clean local distribution — 2026-10-26

- Removed all seeded projects, the sample-project generator, sample entry points, and bundled measurement datasets.
- Added a first-run workspace with create/import actions and no automatic project creation.
- The clean workspace uses a separate storage namespace. Previous development data is not loaded or deleted.
- Browser inspection confirms an empty first-run workspace with English copy.
- All nine automated software checks pass; they do not insert data into the app.
- Added Start.command for macOS local startup. The full source remains editable and buildable.
- The previously deployed online version has not received this update because publishing approval was unavailable.

## AI requirements drafting — 2026-10-26

- Added /api/requirements using the configured course model and validated JSON output.
- Drafts separate stated constraints, missing information, and proposals; all rows start Pending.
- Missing values remain TBD, stated items require matching source evidence, and proposed numeric limits are rejected.
- Added editable review, per-item selection, explicit confirmation, clarification questions, and local draft persistence.
- Saving adds selected requirements without overwriting existing entries; duplicate names and unknown confirmed values are rejected.
- Fifteen automated checks pass, including requirements validation and truncated-response rejection.
- Live browser verification on an isolated port used a generic synthetic description. The course model returned three requirements and two clarification questions. An attempted confirmation of TBD was blocked. Saving two selected items produced one Confirmed and one Pending requirement, with the third excluded.
- Verification did not preload projects or measurements into the normal workspace or distribution files.

## Expanded AI workflow verification

- 18 automated tests pass, including malformed module drafts, invalid quantities/URLs, missing measurements, provider response identity, failed authentication and truncated model output.
- Production asset build succeeds.
- Module proposals append only after review; unknown values are preserved and experiment records are separate from plans.
- Live browser checks on isolated localhost port 4319: Portkey connection returned `gpt-6-luna-global`, a provider response ID, 49 input tokens and 10 output tokens in 3.03 seconds.
- Live architecture draft was edited, saved into the block diagram, and retained after reload.
- Live test plan was reviewed, saved and retained after reload while the actual measurement record count remained zero. Both calls used an explicitly synthetic sensor-logger project; no user project measurements were transmitted.

## User-managed API configuration

- Automated coverage verifies same-origin/token protection, provider switching over existing environment keys, rejected invalid configurations, key omission from responses, immediate activation, restart persistence, owner-only file permissions and disconnect persistence.
- Isolated browser verification on port 4320 used a synthetic nonfunctional key: saved from a blank welcome screen, reopened with the secret field empty, disconnected, and displayed a real no-key error when testing. No synthetic credential was sent to an external provider.
- No real user key was changed during verification.

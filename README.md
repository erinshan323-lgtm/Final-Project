# Circuit Journal

A hardware engineering workspace connecting requirements, circuit blocks, components, design revisions, measurements, AI suggestions, and project handoffs.

This distribution starts empty: there are no sample projects, generated measurements, or bundled measurement datasets. Automated software checks in `tests/` do not populate the app.

## Run locally

Requires Node.js 20 or later. No npm dependencies are needed.

```sh
cd circuit-journal
# Configure AI in the app, or set PORTKEY_API_KEY in a local/parent .env.
npm start
```

On macOS you can also double-click `Start.command`. Keep the Terminal window open while using the app, and press Control-C there to stop it.

Open http://127.0.0.1:4317. Environment variables already set in the process take priority, followed by the project `.env`, then the parent directory `.env`. This supports the course submission layout with the teaching staff's `.env` one directory above the cloned repository.

Use `PORTKEY_API_KEY` for the course provider; the model is fixed to `gpt-6-luna`. Personal OpenAI credentials use `OPENAI_API_KEY`, with optional `OPENAI_MODEL` (default: `gpt-6-astra`).

Without a key, project editing, measurements, revision snapshots, and exports remain available. The assistant reports that it is disconnected instead of generating simulated answers. Do not enter keys into chat or project fields.

## Features

- An empty workspace on first launch. Create your own hardware projects or import a project backup. No preloaded projects, component choices, or measurement datasets.
- AI-assisted requirements drafting: describe an idea, review extracted constraints and clarification questions, edit values, and save selected requirements.
- Editable requirements, circuit blocks, BOM entries, source links, design decisions, and revision snapshots.
- CSV import with explicit time and measurement column selection; V/mV, A/mA, and temperature support.
- Mean, full-window peak-to-peak, standard deviation, minimum, maximum, and all-sample range checks. Missing limits never produce a passing result.
- Raw CSV preservation, test conditions, design snapshots, and comparisons between experiments.
- Server-side Responses API assistant with real token usage, manufacturer web research, and source links. Suggestions are saved only when accepted by the user.
- SVG architecture diagrams, BOM CSV, complete project JSON, and standalone HTML handoff exports.
- English interface, validation messages, AI instructions, exports, and documentation.
- Larger, stronger typography; hover and press feedback; brief transitions that honor reduced-motion preferences.

## Import measurements

```csv
time_s,output_V
0,9.98
0.001,10.02
0.002,10.01
```

Use unique headers. Files are limited to 2 MB and 10,000 rows. Time must be in seconds and strictly increasing. Selecting mV or mA converts values to V or A; targets and absolute tolerances always use V, A, or °C.

Missing values, non-finite numbers, inconsistent column counts, and duplicate timestamps are rejected. Peak-to-peak covers the full uploaded window and is not automatically interpreted as steady-state ripple. Check that test conditions are comparable before interpreting differences.


## Storage and current boundaries

Projects are saved in this browser's localStorage, without cross-device synchronization. Export JSON backups regularly; clearing browser storage removes local projects. Importing a backup creates a new project copy.

This clean release uses a separate browser storage namespace, so earlier development projects are not loaded automatically. Existing data in the previous version is left untouched. To transfer your own earlier work, export its JSON backup and import it explicitly.

The circuit editor currently produces **system architecture diagrams, not pin-level schematics**. ERC, SPICE simulation, full EDA generation, PDF/image interpretation, and instrument control are not implemented.

The assistant receives project summaries and statistics from the five most recent tests, not raw CSV files. It does not automatically modify the BOM or revisions. Suggestions require engineering verification.

## Safety and usage

- Keys stay on the server and are excluded from project exports. Project text is escaped before rendering.
- Notes and retrieved material are treated as untrusted evidence. The model has no code execution, hardware actuation, or project mutation tools. Prompt instructions alone do not eliminate injection risk.
- Input length is bounded; output is limited to 128 tokens for connection checks, 2,200 for requirements/chat, and 4,000 for module drafts, research to three tool calls, and requests to 90 seconds.
- In-memory rate limiting allows 20 requests per user/source per hour per instance. Restarts and multiple instances can reset this limit; it is not a durable total budget. Configure a provider budget for production use.
- Actual input, cached input, and output usage is recorded. No token prices or unexecuted calls are fabricated.

## Verify and build

```sh
npm test
npm run build
```

Tests cover statistics, unit conversion, invalid data, escaped text, parent-directory environment loading, same-origin restrictions, and API usage parsing. API unit tests mock provider calls; live verification requires a key.

`scripts/build.mjs` packages all browser assets in a Worker ES module. An optional `.openai/hosting.json` can supply hosting configuration; it is not required for local use or building. Configure hosted keys as server-side environment variables, never in the bundle.

The HTML handoff is a product feature, not the complete 10–15 page final course report. Course submissions still need competitor research, real-user validation, costs, and safety evidence.

## Draft requirements with AI

1. Create a project, then select **Draft requirements** on Overview or **Draft with AI** in Design workbench.
2. Describe the idea and known constraints. The assistant receives this text and the design summary; raw measurements are not included.
3. Review the draft. Stated requirements carry source evidence. Missing values remain `TBD`, with clarification questions. Suggestions are proposals, not established facts.
4. Edit each value, deselect unwanted items, and explicitly choose **Confirmed** where appropriate. Unknown values must stay **Pending**.
5. Select **Save selected requirements** to add the reviewed items. Existing requirements are never overwritten; duplicate names must be renamed or deselected.

Drafts and review edits are saved locally and included in project JSON backups. Closing the generation dialog cancels the browser request; an upstream request already submitted may still be billed. Successful generation records actual token usage. A new generation replaces only the unsaved draft, not approved requirements. Source matching and review reduce errors but do not prove that an AI interpretation is technically correct.

## AI assistance throughout the workspace

The configured course model is `gpt-6-luna`, accessed through Portkey's Responses API. There are no simulated AI replies or offline canned fallbacks. Settings distinguishes key configuration from a live provider response. **Run live connection test** sends a minimal request and shows the actual response ID, provider-reported model, latency, timestamp and token usage. Missing provider metadata is shown as unavailable, never fabricated.

- Requirements: extract constraints, preserve unknown values, review and save selected requirements.
- Design workbench: draft architecture blocks and design decision proposals.
- Bill of materials: draft candidate parts with optional manufacturer research, then edit and save selected rows.
- Experiments: create test plans, interpret recorded observations and statistics, or analyze a particular test. Plans remain marked **Not executed** and do not create measurement records.
- Timeline: summarize recorded project history.
- Settings: draft an evidence-based handoff narrative; saved narratives are included with decisions in the standalone export.

All generated items require an explicit review/save step. Existing blocks and BOM rows are preserved; duplicate names/references are rejected. Pending drafts persist in the project archive and appear below the workspace for later review. AI narrative documents are stored as typed design records and also displayed in their relevant section. Full AI responses, usage and response identifiers are available in the assistant history and usage export. Draft calls share the existing 20 requests/hour per-instance quota.

A system block diagram is not a pin-level circuit schematic. Component candidates, test procedures and interpretations still require engineering verification. The app does not operate instruments, invent measurements, or automatically validate hardware. Source links and web citations are evidence to inspect, not proof that a part fits every constraint.

## Configure your own API in the app

On the welcome screen, select **Configure AI**, or open **Settings & data → Configure AI** in an existing project.

1. Choose **Course Portkey** or **OpenAI**.
2. Enter your own API key. Portkey uses the course model `gpt-6-luna`. For OpenAI, enter the exact model identifier available to your API account.
3. Select **Save configuration**. Changes take effect immediately, without restarting the server.
4. Reopen the configuration dialog and select **Test saved connection**, or use the live test in Settings. Saving alone does not verify access.

The password field never reveals an existing key. Leave it blank to keep the active key for the same provider; switching providers requires a key. **Disconnect AI** removes the locally saved key and disables AI, including environment fallback, until you save a new configuration. Original `.env` files remain unchanged.

Credentials are stored as plaintext in `.local-ai.json` in the local project directory, with owner-only permissions (`0600`). This file and update backups are excluded by `.gitignore`; keys are not returned by configuration endpoints, stored in browser storage, or included in project exports. Local settings override environment credentials, so selecting OpenAI works even if a course Portkey key is present in `.env`. Never distribute `.env`, `.local-ai.json`, or an unfiltered project-folder ZIP. Share a clean Git checkout instead.

This configuration interface is for the localhost Node server. It is not a multi-user hosted credential vault and is not exposed in the deployed Worker. Hosted deployments continue to use server-managed secrets.

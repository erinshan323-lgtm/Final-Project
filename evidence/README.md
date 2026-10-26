# Verification evidence

The measurement fixture is synthetic, not a hardware measurement. pilot-handoff.html is a separate user-supplied usage artifact with no measurements; see pilot-status.md for its findings. The model responses and token counts are actual provider outputs. Nothing in this folder is loaded automatically by the app. Import verification-project.json manually only if you want to inspect the captured evidence. It contains pending drafts, not a completed user pilot.

The app usage screenshot shows seven successful calls: 16,082 input and 2,652 output tokens. live-runs.json additionally includes the rejected architecture call (528 input, 425 output), bringing the full ledger to eight calls, 16,610 input and 3,077 output. The first architecture response failed validation, so its original provider response ID was not preserved by that error route.

Cost calculations use published OpenAI Standard retail rates as a planning proxy, including cache writes. They are not a Portkey invoice. See report.html for assumptions and limitations.

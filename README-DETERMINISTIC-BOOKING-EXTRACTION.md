# ScriptFlow Pro — Deterministic Booking Extraction

The Transcript Studio **Analyze & Populate** feature no longer uses Gemini, Puter AI chat, Qwen, or any other LLM for booking extraction.

## Flow

Audio/transcript -> local Whisper transcription (for audio) -> deterministic parser -> booking format.

The parser uses local JavaScript rules for:
- labeled field extraction
- email detection
- phone detection
- date/time/time-zone detection
- role detection
- website/current-setup detection
- website-goal detection
- what-to-show detection
- interest/attitude detection
- objection/concern detection
- meeting-angle generation
- confidence indicators

Missing or ambiguous information is returned as `Not specified` rather than invented.

## Why this is fast

The Analyze & Populate step does not download or initialize a second language model. It runs synchronously in the browser and normally completes immediately after the transcript is available.

## Cost

The booking extraction itself has no API call, model charge, or provider quota. It is ordinary browser-side JavaScript.

Audio transcription remains separate and continues to use the existing local Whisper/Transformers.js implementation.

## Testing

All JavaScript files in `js/` pass Node syntax validation. The main local HTTP resources (`index.html`, `style.css`, `js/app.js`, and `js/transcript-studio.js`) were also checked for successful HTTP responses in a local server smoke test.

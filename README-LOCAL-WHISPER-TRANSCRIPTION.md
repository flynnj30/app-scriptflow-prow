# ScriptFlow Pro — Local Whisper Transcription

Transcript Studio now uses Transformers.js + ONNX Whisper for speech-to-text instead of a metered transcription API.

## What this means

- Transcription runs locally in the user's browser.
- No transcription API key is required.
- No per-minute transcription bill is charged to ScriptFlow.
- There is no provider transcription quota imposed by ScriptFlow.
- After the model is cached, repeat transcription can run without downloading the model again.
- WebGPU is used when available; WASM is used as the fallback.
- OPUS/OGG/WebM and other browser-decodable audio are decoded with Web Audio before Whisper inference.

## Model choices

- Fast: `onnx-community/whisper-base_timestamped`
- Balanced: `onnx-community/whisper-small_timestamped`
- Higher accuracy: `onnx-community/whisper-small_timestamped`

The balanced/higher-accuracy model is larger and requires more RAM/GPU resources. The first run downloads model weights from Hugging Face and caches them through Transformers.js.

## Important limitation

"Unlimited" means there is no API-minute quota or transcription bill imposed by a transcription provider. Actual throughput is limited by the user's CPU/GPU, browser memory, storage, and model size. This is not a guarantee of unlimited speed or unlimited hardware resources.

## AI booking analysis

The optional **AI Analyze & Populate** button still uses Puter AI/Gemini. That feature is separate from local transcription and therefore remains subject to the user's Puter allowance and service availability.

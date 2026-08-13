# Google Gemini AI integration

ScriptFlow Pro now uses Google Gemini through Puter.js for **AI booking-data analysis** in Transcript Studio.

## What changed

- Booking extraction no longer uses the previous OpenAI chat model.
- Primary model: `gemini-3.1-flash-lite`
- Google-only fallback: `gemini-2.5-flash`
- Speech-to-text remains unchanged and continues using the existing Puter speech2txt configuration.
- Quick translation remains unchanged because Puter's current `speech2txt()` documentation supports OpenAI and xAI STT providers, not Google Gemini.

## Important usage note

Puter.js does not provide a developer-owned unlimited Google Gemini API quota. Puter's current User-Pays model gives each Puter user a free monthly allowance, after which Puter may prompt the user to upgrade. The Google model is therefore a change of AI provider/model, not a bypass of Google's or Puter's usage limits.

No Google API key is added to the frontend.

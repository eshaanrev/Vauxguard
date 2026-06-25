# VauxGuard

A web app that detects deepfake and AI-synthesized voices. Upload a voice clip and VauxGuard extracts a set of acoustic features from the raw audio, then runs them through an LLM acting as an audio-forensics analyst to return a verdict — **REAL** or **FAKE** — with a confidence score.

## How it works

1. Audio is uploaded and transcoded to 16 kHz mono WAV with FFmpeg.
2. Seven acoustic features are computed directly from the waveform:
   - RMS energy and energy variance across 50 ms frames
   - Silence ratio
   - Spectral centroid and spectral flatness (via a DFT over the magnitude spectrum)
   - Zero-crossing rate
   - Pitch regularity (autocorrelation peak-lag variance)
3. The feature vector — with known typical ranges for real vs. synthetic speech — is sent to an LLM forensic analyzer (Claude), which weighs the features together and returns calibrated JSON: `{ verdict, confidence, reasoning }`.

This keeps the heavy signal processing deterministic and on the server, and uses the model only for calibrated judgment over the extracted features.

## Features

- **Deepfake voice detection** with a confidence score
- **Acoustic feature extraction** pipeline (energy, spectral, and temporal features)
- **Accounts** with Supabase auth and per-user profiles
- **Usage tiers** — free accounts get a limited number of analyses; premium unlocks unlimited use and detailed reasoning
- **Detailed reasoning** from the analyzer on premium tier

## Tech stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS 4
- **Auth & database:** Supabase (`@supabase/ssr`)
- **Audio:** fluent-ffmpeg / ffmpeg-static, node-wav
- **AI:** Anthropic Claude (`@anthropic-ai/sdk`)

## Setup

```bash
npm install
npm run dev          # start the dev server at http://localhost:3000
```

Create a `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

Then run the SQL in `supabase_setup.sql` against your Supabase project to create the `profiles` table and policies.

```bash
npm run build        # production build
npm run start        # serve the production build
```

## Screenshots

<!-- Add screenshots here -->
| Upload & analyze | Result + confidence | Dashboard |
| --- | --- | --- |
| _coming soon_ | _coming soon_ | _coming soon_ |

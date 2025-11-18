# Reloadthegraphics — Local Electron + React Media Extractor

**Purpose:** Local desktop app (Electron + React) that extracts downloadable media (video/audio) from links using local `yt-dlp` and `ffmpeg`.  
**No API keys or remote database required.** All state stored in localStorage and Electron userData.

## Features
- Paste a video/page URL and extract downloadable media.
- Uses system `yt-dlp` to probe and download best formats.
- Merges video+audio with `ffmpeg` when required.
- Stores job history in localStorage and in Electron userData.
- Local-only: no external servers or API keys.

## Requirements
- Node.js (16+)
- npm
- `yt-dlp` installed and on PATH
- `ffmpeg` installed and on PATH

## Run (development)
1. Install dependencies:
```bash
npm install
```
2. Run dev:
```bash
npm run dev
```
This starts Vite dev server and Electron in development mode.

## Build
```bash
npm run build
```

## Security
This app executes local binaries and downloads remote content to disk. Only use with trusted URLs and on a trusted machine.


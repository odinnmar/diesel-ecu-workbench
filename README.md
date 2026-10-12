# Diesel ECU Workbench

A local, offline desktop workspace for diesel ECU calibration calculations and analysis.

## What changed in 1.1.0

- Redesigned desktop workspace with a fixed navigation rail, compact application header, contextual page titles, and a consistent dark engineering UI.
- Improved spacing, typography, controls, tables, result cards, and status cues.
- Preserved the existing calculators, map tools, compare workflow, logs, unit conversions, project notes, and exports.
- Windows packaging does not attempt to publish a GitHub release automatically.

## Run locally

Install Node.js 22 or newer, then run:

```bash
npm install
npm start
```

## Build Windows installer

On Windows, run `BUILD-WINDOWS.bat`, or use:

```bash
npm install
npm run dist:win
```

The installer is written to `release/Diesel-ECU-Workbench-Setup-1.1.0.exe`.

## Notes

This is an offline calculation and analysis tool. Always verify map definitions, units, scaling, and calculations independently before using any result in an ECU calibration. Keep untouched backups of original files.

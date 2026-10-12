# Diesel ECU Workbench — Windows installer build

This repository packages the stable V3.13 offline HTML workbench in Electron and builds a Windows x64 NSIS installer using GitHub Actions.

## Build

Push/commit the project to GitHub, then open **Actions → Build Windows installer** and run the workflow. Download the `Diesel-ECU-Workbench-Setup` artifact from a successful run.

The application entry file and icon are at the repository root. Keep `index.html`, `main.js`, `package.json`, and `app.ico` together.

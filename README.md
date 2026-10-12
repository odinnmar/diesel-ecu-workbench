# Diesel ECU Workbench — Windows Desktop Edition

Version 1.0.0. Built around the stable V3.13 HTML workbench (not the later red-text OCR experiments), with a cleaner desktop-style interface and a Windows installer configuration.

## Easiest route: build the installer in GitHub's cloud (no Node.js on your PC)

You only need to do this once:

1. Create a **private** repository on https://github.com/new (any name, e.g. `diesel-ecu-workbench`). You do not need to add a README or license.
2. On the new repository page, choose **Add file → Upload files**.
3. Extract this ZIP on your PC, open the extracted folder, select all its contents (including the hidden `.github` folder), and drag them into GitHub's upload page. Commit the upload to the default branch.
4. Open the repository's **Actions** tab. Select **Build Windows installer** and press **Run workflow** if it hasn't started automatically.
5. Wait for the run to finish green. Open that run and download the artifact named **Diesel-ECU-Workbench-Setup**. Inside is `Diesel-ECU-Workbench-Setup-1.0.0.exe`.

The build runs on GitHub's Windows machine; Node.js is installed there automatically. Do not share your GitHub password or access tokens with anyone. Keep the repository private if you don't want the source public.

## Future patches

Send me the requested change and the latest project ZIP/source when needed. I'll patch the source and update the version. To build a new installer, upload the updated files to this repository; the same GitHub Actions workflow produces a new `.exe` artifact. This is a manual update process, not an in-app auto-updater.

## Important notes

- The installed app is designed to work offline after installation.
- The first cloud build downloads the Electron packaging dependencies on GitHub's runner.
- Windows may show a SmartScreen warning because the installer is not code-signed.
- Packaging does not validate calibration assumptions or guarantee OCR accuracy. Verify recognized map values before using them.

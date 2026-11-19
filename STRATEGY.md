# LA PERLA Cover Studio — build log

Built in this session for make.fun gta6-cover-art-01. The initial command was the requested kit initialization. Its first sandboxed attempt could not spawn git; the permitted retry returned `makefun anchor 6cf58c3bba1d52adc5d8ef9aa4f984ff694a41dd round 34096111` before any file was written.

## What was built

The Cover Snap starter UI and one-photo renderer were replaced with an original coastal crime poster studio. The deliverable is plain HTML, CSS and JavaScript in app/, with no build, dependencies, backend, account or runtime API calls.

- Six original polygon compositions: Coastline (5 panels), After hours (6), Seven sins (7), Headliner (hero and strips), Crossfire (diagonals), Heatwave (strips and split center).
- Six colour stories: Sunset, Golden hour, Neon violet, Perla teal/gold, Halftone, Rose noir. Adjustable tint intensity, optional locally computed cel/ink treatment and halftone dots.
- Multi-photo FileReader import and drag/drop. Photos remain in browser memory. Each panel has independent photo, crop position and zoom. Click or use the panel selector; drag, scroll, use the zoom slider or arrow keys. Center crop and use-in-all-panels are one click.
- Editable fitted display title, script subtitle, tagline bar, edition badge and signature border. Preview and PNG export use the same renderer and await local fonts.
- Square 1080×1080, portrait 1080×1350 and landscape 1920×1080 PNG downloads.
- Original cream/dark-plum editor, responsive preview, local/private indicator, live status messages, accessible labels, focus styles and transient panel selection highlight that is separate from the exported canvas.
- Anton and Kaushan Script downloaded from the official Google Fonts repository into app/fonts/, with their SIL OFL licenses. All font references are local.
- Default photos are the supplied free-to-use AI-generated salsa.webp, domino.webp, speedboat.webp and ferris.webp. No boulevard.jpg, pier.jpg, game assets, official logos, game fonts or third-party application code were imported.

An additional original character illustration was attempted with the built-in image_gen tool following the imagegen skill. The tool returned HTTP 403, “Image generation is not enabled for this group.” No image was produced or saved. No key was requested or placed in any file. The shipped app uses the four supplied AI photographs and computes its treatments locally; it does not claim to run an image model offline.

## Run

Use Node 22.18 or later:

```sh
node serve.ts
```

Open http://localhost:8080 in desktop Chrome. Select a layout and grade, import photos or use the samples, select a panel and crop, edit the lettering, pick a format and export. Any static HTTP server can serve app/. Nothing outside app/ is required by the browser.

Package the entry:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

main.ts retains the kit's packaging library unchanged and adds an authored LA PERLA entry header. Generated out/ and temporary Playwright artifacts are ignored; the three final screenshots are committed.

## Verification and revisions

All browser interaction and screenshot capture used the configured Playwright MCP headless Chrome server.

1. Opened the real app served by node serve.ts. Both local fonts and all samples loaded successfully. Browser console: zero errors and warnings.
2. Selected all six layouts and all six grades. Verified panel selector counts (5, 6, 7, 5, 5, 5).
3. Imported salsa.webp through the actual file input. The library grew from four to five photos. Exercised pointer dragging, zoom, center crop and assigning a photo to all panels.
4. Changed title, subtitle, tagline and edition. Changed one panel's zoom to 1.4 and switched to another panel: the other remained 1.0.
5. Put the browser context into offline mode after loading. Imported a photo, edited text and crops, reset the composition and downloaded all three sizes successfully. Captured runtime requests: []; failed requests: []. Static initialization requests were exclusively successful same-origin files, with zero external requests.
6. Saved the actual PNG downloads and decoded/verified them with Pillow: 1080×1080, 1080×1350 and 1920×1080, all valid PNGs. No simulated export path was used.
7. Visually reviewed exports. Revised title stacking, script spacing, imprint width, footer position and default hero crop; added a transient crop panel indicator. Re-exported with the revised renderer.
8. Captured screenshots by displaying each actual download's blob URL as an image in Chrome and taking a Playwright screenshot at the target viewport. No compositing, artwork editing or borrowed screenshot. The editor screenshot shows the live app with five local photos and all controls.
9. Verified final screenshot files decode, fit the byte cap and dimension limits: 1-cover.jpg 1280×720 / 210936 bytes; 2-editor.jpg 1280×960 / 180072 bytes; 3-cover.jpg 1024×1280 / 208965 bytes. shots.json describes these exact compositions.
10. Ran JavaScript syntax checks and git diff whitespace checks. Built out/dossier.json using the requested command and verified it equals a fresh buildDossier output, with three screenshots.
11. Ran the kit check from the kit directory. Local checks pass; transcript, ownership and actual judging checks are reserved for submission by the kit. This work is committed locally without pushing or submitting.

## Asset sources and licenses

- app/samples/*.webp: provided AI-generated free-to-use samples.
- Anton: https://github.com/google/fonts/tree/main/ofl/anton — app/fonts/Anton-OFL.txt.
- Kaushan Script: https://github.com/google/fonts/tree/main/ofl/kaushanscript — app/fonts/KaushanScript-OFL.txt.
- Application code: written in this session, MIT. vendor/makefun-app.ts and serve.ts are the unchanged supplied kit plumbing.

## Sample photo fix — 2026-11-19

Added the supplied beach, chiva and rooftop samples and assigned default panel i directly to photo i. Removed renderer index wrapping so every layout starts with a distinct photo in each of its five, six or seven panels.

Verified all six layouts through their panel selectors in Playwright: Coastline 5, After hours 6, Seven sins 7, Headliner 5, Crossfire 5 and Heatwave 5, with no repeated default sample. All seven sample images decoded successfully. Imported speedboat.webp through the file input while offline; the library grew to eight photos. Import, editing and all three PNG downloads made zero runtime network requests and had zero failed requests; initialization used only local static files.

Decoded the actual exported PNGs with Pillow and confirmed exact dimensions: square 1080×1080, portrait 1080×1350 and landscape 1920×1080. Retook and visually reviewed the screenshots in Chrome; both covers show salsa, domino, speedboat, ferris and beach once each. Final JPEGs: 1-cover.jpg 1280×720 / 194459 bytes, 2-editor.jpg 1280×960 / 156075 bytes, 3-cover.jpg 1024×1280 / 217345 bytes. All are below 256 KiB. Updated shots.json to describe the imported editor photo.

Browser console: zero errors and warnings. JavaScript syntax and diff whitespace checks passed. Rebuilt out/dossier.json with the requested packaging command. The kit check completed with 5 passed and 0 failed; transcript and submission checks remain with the site.

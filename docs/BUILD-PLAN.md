# LA PERLA implementation plan

The supplied specification authorizes an original, offline static cover editor. Canvas 2D will be the single renderer for live previews and all exports. Local Anton and Kaushan fonts supply original display and script lettering. The four supplied AI photographs are the defaults. No third-party app code is used.

1. Replace starter UI with an editorial three-column studio: art direction, live preview, photo and lettering controls.
2. Implement six polygon layouts, six grades, local comic treatment, title, subtitle, tagline, edition and border drawing.
3. Wire FileReader multi-photo import, per-panel crop/zoom, sample assignment, fill-all, keyboard cropping and responsive formats.
4. Verify real browser interactions and PNG dimensions, local-only resource use, all layouts and grades, invalid file handling and long captions.
5. Capture actual exported images and editor using Playwright MCP. Write the build log, run dossier and kit checks, then commit the completed work without pushing.

Verification focuses on independent crops, all three aspect ratios, font readiness, failed imports, long text fitting and export cleanliness. All implementation is performed in this session. The requested image generation tool was tried and returned a group-level 403; supplied AI samples remain the assets.

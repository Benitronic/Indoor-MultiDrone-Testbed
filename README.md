# Indoor Multi-Drone Testbed project page

Static, responsive academic project page. Content follows the supplied author manuscript dated 17 November 2026. No framework, database, sign-in, or build step is required.

## Preview locally

Run `python3 -m http.server 8000` and open http://localhost:8000.

## Publish on GitHub Pages

The downloadable GitHub package contains the contents of `dist/` at its root. Create a new repository (suggested name: `Indoor-MultiDrone-Testbed`) and upload those files and the `assets` folder, keeping their relative paths. Under Settings → Pages, choose Deploy from a branch, then main and / (root). GitHub displays the resulting URL after deployment. The `.nojekyll` file is included.

Alternatively, add the package inside a subfolder of an existing GitHub Pages repository. Do not overwrite the existing page unless that is intended.

The project page is maintained in Benitronic/Indoor-MultiDrone-Testbed. The GitHub connector returned HTTP 403 for writes; the initial publication used the authenticated GitHub web interface.

## Edit content

- `index.html`: page structure, overview, platform, marker photos, resources, citation, contacts.
- `style.css`: responsive layout, colors and typography, reduced-motion preferences.
- `data.js`: all eight experiment descriptions and Tables 13/15 tracking summaries.
- `app.js`: category filters, hash-linked experiment dialogs, image enlargement, flight selectors and chart, menu and video controls, citation copying.
- `assets/`: PDF, marker photos and their PDFs, manuscript figure crops, optimized demonstration video, and poster.

### Add photos, GIFs or videos to an experiment

Place the new file in `assets/`. In its `data.js` experiment entry, add:

```js
media: [
  {type: 'image', src: 'assets/setup.webp', caption: 'Setup for the static test.'},
  {type: 'video', src: 'assets/hover-r01.mp4', caption: 'Hover, N=6, R01. Official session identifier: ...'}
]
```

GIFs use `type: 'image'`. Prefer compressed MP4 for longer loops. Supply an accessible caption and identify the session. Additional media appears automatically in the experiment dialog.

### Add a condition-specific flight video

In `data.js`, add an entry to `flightVideos`:

```js
flightVideos: {
  'Circle-6': {src: 'assets/circle-6-r01.mp4', session: 'R01 / full session ID', caption: 'Six-drone circular tracking.'}
}
```

The matching selection then displays the clip. The adjacent metrics continue to summarize all three repetitions. Overview footage is not assigned to a maneuver or official session.

### Add supplementary files

Add the approved files under `assets/` and insert real download links in the resources section. Do not use empty links. The supplementary PDF and CSV S6–S9 were referenced by the manuscript but not supplied for this version; the page says so explicitly.

## Evidence and editorial rules

- Sources: supplied manuscript and marker PDFs; platform demonstration supplied by the author.
- Cropped manuscript figures: 3, 6, 7, 9, 10, 11, 13, 14, 15, 16. Original PDF remains available for full captions.
- Flight chart values are table transcriptions, not reconstructed trajectories. Error bars represent between-flight/session sample SD.
- Keep nominal MoCap rate, standalone radio timing, integrated bench timing, and flight-loop timing distinct.
- Position-estimation drift and calibration repeatability are not absolute-accuracy measurements.
- Sampled separation does not establish continuous-time collision guarantees.
- Firmware defaults describe the expected onboard controller; active gains/controller were not logged.
- Use M0 for the reported simultaneous flights, following the current manuscript.
- Endurance refers to the tracking interval and three tested battery flights, not total flight duration or isolated pack performance.
- No DOI or acceptance status is asserted. The template DOI in the PDF is not used as a publication link.
- No arena control code, credentials, raw experimental logs, or restricted software are included.

## Checks

JavaScript syntax checked with `node --check`; local asset references checked; main interactions checked in a browser. No separate framework dependencies are needed. The video opens muted with pause/play controls and reduced-motion handling. Video is web-optimized and audio has been omitted; the originally uploaded source remains separate.

## Media rights

User-provided media and manuscript figures remain attributable to their respective rights holders. No blanket source-code or media license is asserted by this project page.

# Compass of Ice and Fire

## Disclaimer

Compass of Ice and Fire is an unofficial, non-commercial fan project. It is not affiliated with or endorsed by George R. R. Martin, HBO, or any other rights holders.

## Data Attribution

This project uses map data based on the fan-made Westeros GeoJSON project created by **cadaei**, **theMountainGoat**, and **Tear**, with copyright attributed to **George R. R. Martin**.

The original data has been modified for use in this project, including filtering, processing, assigning stable feature identifiers, and other transformations.

The original dataset is licensed under the **Creative Commons Attribution–NonCommercial–ShareAlike 3.0 Unported (CC BY-NC-SA 3.0)** license.

- Source: https://github.com/mapbox/GOT-Inspired-Map
- License: https://creativecommons.org/licenses/by-nc-sa/3.0/

## Data Processing

Original GeoJSON files are modified only to fix obvious factual issues such as spelling mistakes. All structural transformations are performed by preprocessing scripts.

## Tech Stack

- **Angular 21** — standalone components, signals, lazy-loaded routes
- **MapLibre GL** (`maplibre-gl` + `@maplibre/ngx-maplibre-gl`) — WebGL map renderer
- **NGXS** — GeoJSON data store
- **Angular Material** — UI components

## Development

```bash
npm start        # build geodata + serve
npm run build    # build geodata + production build
```

Geodata is preprocessed from `vendors/` into `geodata/` by `scripts/build-geodata.mjs` before every serve/build.

## License

Copyright © 2026 vlad-lap

The source code is licensed under the Mozilla Public License 2.0.

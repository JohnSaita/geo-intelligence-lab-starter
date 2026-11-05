# Geo Intelligence Lab GeoJSON Viewer

Drop GeoJSON files onto a Mapbox map, click any feature to read its properties, and get a plain-language fix when a file is wrong. A React + TypeScript + Vite starter you can run in two minutes and build on.

By [Geo Intelligence Lab](https://www.youtube.com/@GeoIntelligenceLab). New web mapping tutorial every Thursday.

## Run it

You need Node.js 20.19 or newer and a free [Mapbox public token](https://account.mapbox.com/access-tokens/) (starts with `pk.`).

```bash
git clone https://github.com/JohnSaita/geo-intelligence-lab-starter.git
cd geo-intelligence-lab-starter
npm install
cp .env.example .env      # Windows: copy .env.example .env
# paste your token into .env:  VITE_MAPBOX_TOKEN=pk.…
npm run dev
```

Open the URL Vite prints. Restart `npm run dev` after you edit `.env`; Vite reads it once at startup.

## What it does

- **Drop files anywhere** on the page, or use *Choose files*. Several at once. Everything stays in your browser.
- **Flies to your data** and shows what is in it: "241 points", "25 polygons", "3 lines".
- **Catches common problems** and says how to fix them: projected coordinates (UTM, EPSG:3857), shapefiles and other formats, broken JSON, features without geometry, very heavy files.
- **Click a feature** to highlight it and read its properties. Copy them as JSON.
- **Layer controls:** show or hide, recolour, zoom to, remove.
- **Four basemaps:** light, streets, satellite, dark. Your layers survive the switch.
- **Keep the old workflow:** `.geojson` files placed in `src/data` still load on startup.
- **Phone friendly:** the panel becomes a bottom sheet.

## Brand

The look comes from the Geo Intelligence Lab brand kit v2.0:

- `src/brand-tokens.css` is a copy of the kit's `09-design-tokens/tokens.css` (`--gil-*` colour variables). `src/index.css` maps them to the app's own names.
- `src/assets/` holds the official horizontal logos (reversed on the navy panel header, full colour on the token screen). Keep the logo at 160 px wide or more.
- `public/` holds the favicons, app icons, `site.webmanifest` and the social share image from the kit.
- Layer colours and the amber selection highlight come from the kit's map palette (`mapbox-expressions.js`). Amber is reserved for the selected feature and the single "Work with me" button.
- Type is Montserrat (headings), Inter (interface) and JetBrains Mono (coordinates), bundled as woff2 in `src/fonts` (SIL Open Font License, see `src/fonts/README.txt`).

To update the brand, replace those files from the kit and rebuild. Text, links, basemaps and layer colours are in `src/config.ts`.

## Where things live

| File | Job |
|---|---|
| `src/lib/geojson.ts` | Parse, validate and measure GeoJSON. Plain functions, no React |
| `src/hooks/useLayers.ts` | Layer state: add files, samples, colour, visibility |
| `src/components/MapCanvas.tsx` | The Mapbox map and every layer, via `react-map-gl` |
| `src/components/Panel.tsx` | Drop zone, layer list, basemap switch |
| `src/components/Inspector.tsx` | Properties of the selected feature |
| `src/components/WorkWithMe.tsx` | The contact card |
| `src/components/TokenGate.tsx` | The screen shown when the token is missing or rejected |

Two details worth reading in `MapCanvas.tsx`: a circle layer also draws the vertices of lines and polygons, and a fill layer shades the area between the vertices of a line, so each layer carries a `geometry-type` filter.

## Deploy to GitHub Pages

The included workflow (`.github/workflows/deploy.yml`) builds the app on every push and publishes it with GitHub Pages. No `gh-pages` branch is needed. One-time setup:

1. **Secret.** Repository Settings, Secrets and variables, Actions, New repository secret. Name: `VITE_MAPBOX_TOKEN`. Value: your public `pk.` token.
2. **Pages.** Settings, Pages, Build and deployment, Source: *GitHub Actions*.
3. **Token restrictions.** In your Mapbox token settings add `https://<your-username>.github.io/` under URL restrictions. A public token is visible in the built site, so the restriction is what protects it.
4. Push to `main` or `master`. The site appears at `https://<your-username>.github.io/<repo-name>/`.

Other hosts (Vercel, Netlify): run `npm run build`, publish `dist/`, and set `VITE_MAPBOX_TOKEN` in the host's settings. Never use a secret `sk.` token in front-end code.

## Data

The Kajiado samples in `public/samples` are from the Geo Intelligence Lab health-access project. Facilities: Kenya Master Health Facility List 2020 (Code for Africa / openAFRICA), healthsites.io and © OpenStreetMap contributors (ODbL). Wards: geoBoundaries gbOpen.

## Work with me

I build custom web maps, risk maps and GIS dashboards. Portfolio: https://johnsaita.github.io · LinkedIn: https://www.linkedin.com/in/john-nkaiwatei

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

## Make it yours

Edit `src/config.ts`. It holds the name, the "Work with me" card text, the links, the basemaps and the layer colours. Change them and the whole interface follows. The colour tokens are at the top of `src/index.css`.

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

## Deploy

```bash
npm run build      # output in dist/
```

Host `dist/` on Vercel, Netlify or GitHub Pages. Set `VITE_MAPBOX_TOKEN` in the host's settings, and in your Mapbox token settings add your site's URL under URL restrictions. Never use a secret `sk.` token in front-end code.

## Data

The Kajiado samples in `public/samples` are from the Geo Intelligence Lab health-access project. Facilities: Kenya Master Health Facility List 2020 (Code for Africa / openAFRICA), healthsites.io and © OpenStreetMap contributors (ODbL). Wards: geoBoundaries gbOpen.

## Work with me

I build custom web maps, risk maps and GIS dashboards. Portfolio: https://johnsaita.github.io · LinkedIn: https://www.linkedin.com/in/john-nkaiwatei

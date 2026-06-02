# Geo Intelligence Lab Starter

A React + TypeScript + Vite starter app for viewing GeoJSON data on a Mapbox map.

The app automatically loads `.geojson` files from `src/data` and displays them as a GeoJSON layer on the map.

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/JohnSaita/geo-intelligence-lab-starter.git
cd geo-intelligence-lab-starter
```

### 2. Add your Mapbox token

Open the `.env` file in the project root:

```bash
VITE_MAPBOX_TOKEN=pk.your_mapbox_public_token_here
```

Use a public Mapbox access token that starts with `pk.` from mapbox.

### 3. Add GeoJSON data

Place one or more `.geojson` files in:

```bash
src/data
```

Example:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Nairobi"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [36.8219, -1.2921]
      }
    }
  ]
}
```

The app loads all `*.geojson` files in `src/data` automatically.

### 4. Install dependencies

```bash
npm install
```

### 5. Run the app

```bash
npm run dev
```

Open the local URL printed in the terminal, usually:

```bash
http://127.0.0.1:5173/
```

You should see a Mapbox map with your GeoJSON layer visible.

## Notes

- Restart `npm run dev` after creating or changing `.env`.
- If you add a new GeoJSON file while the dev server is running and it does not appear, restart the dev server.
- Do not commit your `.env` file.
- The current starter layer is styled for point GeoJSON data.

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
```

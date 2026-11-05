// Make it yours: change the text and links below and the interface follows.
// Colours, fonts and logos come from the Geo Intelligence Lab brand kit (see README, "Brand").

const url = (host: string) => (host.startsWith("http") ? host : `https://${host}`);

export const BRAND = {
  name: "Geo Intelligence Lab",
  product: "GeoJSON Viewer",
  person: "John S Nkaiwatei",
  tagline: "Modern web GIS, location intelligence and GeoAI",
  pitchTitle: "Need a map like this for your organisation?",
  pitch:
    "I build custom web maps, risk maps and GIS dashboards with React and Mapbox. Recent work includes disease transmission risk maps and a health-access study for Kajiado County.",
  services: [
    "Health & accessibility analysis",
    "Disease & risk mapping",
    "Interactive web maps (React + Mapbox GL JS)",
    "Custom GIS web applications",
  ],
  tutorialsNote: "New tutorial every Thursday",
  portfolioHost: "johnsaita.github.io",
  links: {
    portfolio: url("johnsaita.github.io"),
    youtube: "https://www.youtube.com/@GeoIntelligenceLab",
    linkedin: "https://www.linkedin.com/in/john-nkaiwatei",
    source: "https://github.com/JohnSaita/geo-intelligence-lab-starter",
  },
};

export const BASEMAPS = [
  { id: "light", label: "Light", style: "mapbox://styles/mapbox/light-v11" },
  { id: "streets", label: "Streets", style: "mapbox://styles/mapbox/streets-v12" },
  { id: "satellite", label: "Satellite", style: "mapbox://styles/mapbox/satellite-streets-v12" },
  { id: "dark", label: "Dark", style: "mapbox://styles/mapbox/dark-v11" },
] as const;

export type BasemapId = (typeof BASEMAPS)[number]["id"];

/**
 * Layer colours, assigned in order as files are added. From the brand kit's categorical map palette
 * (09-design-tokens/mapbox-expressions.js). Amber is left out on purpose: it marks the selected feature.
 */
export const PALETTE = ["#087FA8", "#36A68A", "#7B6CD9", "#E5636B", "#35B9C9", "#8A9BB0"];

/** Selected-feature ring. Stands out on every basemap and every palette colour. */
export const HIGHLIGHT = "#F4A62A";

/** Sample data offered from the empty state. */
export const SAMPLES = [
  {
    file: "kajiado-wards.geojson",
    name: "Kajiado wards",
    attribution: "Wards: geoBoundaries gbOpen",
  },
  {
    file: "kajiado-health-facilities.geojson",
    name: "Kajiado health facilities",
    attribution: "Facilities: Kenya MFL 2020, healthsites.io, © OpenStreetMap contributors",
  },
] as const;

// Make it yours: change the text and links below and the whole interface follows.

export const BRAND = {
  name: "Geo Intelligence Lab",
  product: "GeoJSON Viewer",
  person: "John S Nkaiwatei",
  pitchTitle: "Need a map like this for your organisation?",
  pitch:
    "I build custom web maps, risk maps and GIS dashboards with React and Mapbox. Recent work includes disease transmission risk maps and a health-access study for Kajiado County.",
  services: [
    "Health and accessibility analysis",
    "Disease and risk mapping",
    "Interactive web maps (React + Mapbox GL JS)",
    "Custom GIS web applications",
  ],
  tutorialsNote: "New tutorial every Thursday",
  links: {
    portfolio: "https://johnsaita.github.io",
    youtube: "https://www.youtube.com/@GeoIntelligenceLab",
    linkedin: "https://www.linkedin.com/in/john-nkaiwatei",
    source: "https://github.com/JohnSaita/geo-intelligence-lab-starter",
  },
} as const;

export const BASEMAPS = [
  { id: "light", label: "Light", style: "mapbox://styles/mapbox/light-v11" },
  { id: "streets", label: "Streets", style: "mapbox://styles/mapbox/streets-v12" },
  { id: "satellite", label: "Satellite", style: "mapbox://styles/mapbox/satellite-streets-v12" },
  { id: "dark", label: "Dark", style: "mapbox://styles/mapbox/dark-v11" },
] as const;

export type BasemapId = (typeof BASEMAPS)[number]["id"];

/** Layer colours, assigned in order as files are added. */
export const PALETTE = ["#2A7AD5", "#0FA3A3", "#8E5BD0", "#D9468F", "#3B9A4A", "#C9731A"];

/** Selected-feature ring. Stands out on every basemap and every palette colour. */
export const HIGHLIGHT = "#FFC21A";

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

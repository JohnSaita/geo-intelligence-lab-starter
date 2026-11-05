import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from "geojson";

export type Kind = "point" | "line" | "polygon";
export type Counts = Record<Kind, number>;
export type Bounds = [west: number, south: number, east: number, north: number];
export type FC = FeatureCollection<Geometry, GeoJsonProperties>;

export interface Parsed {
  data: FC;
  counts: Counts;
  bounds: Bounds;
  warnings: string[];
}

export type ParseResult = { ok: true; value: Parsed } | { ok: false; message: string };

const KIND_BY_TYPE: Record<string, Kind> = {
  Point: "point",
  MultiPoint: "point",
  LineString: "line",
  MultiLineString: "line",
  Polygon: "polygon",
  MultiPolygon: "polygon",
};

const MAX_VERTICES = 500_000;

type Obj = Record<string, unknown>;
const isObject = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

/** Call visit(x, y) for every position in a coordinates array of any depth. */
function walkCoords(c: unknown, visit: (x: number, y: number) => void) {
  if (!Array.isArray(c)) return;
  if (typeof c[0] === "number") visit(c[0], c[1] as number);
  else for (const item of c) walkCoords(item, visit);
}

function visitGeometry(g: Geometry | null | undefined, fn: (kind: Kind, coordinates: unknown) => void) {
  if (!g) return;
  if (g.type === "GeometryCollection") {
    for (const member of g.geometries) visitGeometry(member, fn);
    return;
  }
  const kind = KIND_BY_TYPE[g.type];
  if (kind) fn(kind, g.coordinates);
}

function toFeatures(raw: Obj): Feature[] | null {
  if (raw.type === "FeatureCollection") return Array.isArray(raw.features) ? (raw.features as Feature[]) : null;
  if (raw.type === "Feature") return [raw as unknown as Feature];
  if (typeof raw.type === "string" && (raw.type in KIND_BY_TYPE || raw.type === "GeometryCollection")) {
    return [{ type: "Feature", properties: {}, geometry: raw as unknown as Geometry }];
  }
  return null;
}

/** Why a file can't be read, with the command or menu path that fixes it. Null means "try to read it". */
export function unsupportedFormat(fileName: string): string | null {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  if (ext === "geojson" || ext === "json") return null;
  if (["zip", "shp", "dbf", "shx", "prj"].includes(ext)) {
    return `${fileName} is a shapefile. Convert it first. In QGIS: right-click the layer, Export, Save Features As, GeoJSON, CRS EPSG:4326.`;
  }
  return `${fileName} isn't GeoJSON. Convert it first: ogr2ogr -f GeoJSON -t_srs EPSG:4326 output.geojson ${fileName}`;
}

export function parseGeoJson(text: string, fileName: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "parse error";
    return {
      ok: false,
      message: `${fileName} isn't valid JSON (${detail}). Check for a trailing comma or a file that was cut off.`,
    };
  }

  if (!isObject(raw) || typeof raw.type !== "string") {
    return { ok: false, message: `${fileName} isn't GeoJSON. It needs a "type", such as FeatureCollection.` };
  }
  const features = toFeatures(raw);
  if (!features) {
    return {
      ok: false,
      message: `${fileName} has type "${raw.type}". GeoJSON files are a FeatureCollection, a Feature or a geometry.`,
    };
  }

  const counts: Counts = { point: 0, line: 0, polygon: 0 };
  let vertices = 0;
  let skipped = 0;
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  const kept: Feature[] = [];

  for (const f of features) {
    if (!isObject(f) || f.type !== "Feature" || !f.geometry) {
      skipped++;
      continue;
    }
    let hasGeometry = false;
    visitGeometry(f.geometry, (kind, coordinates) => {
      counts[kind]++;
      hasGeometry = true;
      walkCoords(coordinates, (x, y) => {
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        vertices++;
        if (x < west) west = x;
        if (x > east) east = x;
        if (y < south) south = y;
        if (y > north) north = y;
      });
    });
    if (!hasGeometry) {
      skipped++;
      continue;
    }
    // Numeric ids let the map highlight one feature without reloading the data.
    kept.push({ type: "Feature", id: kept.length, properties: f.properties ?? {}, geometry: f.geometry });
  }

  if (kept.length === 0 || !Number.isFinite(west)) {
    return { ok: false, message: `${fileName} has no features with geometry.` };
  }
  if (west < -180 || east > 180 || south < -90 || north > 90) {
    return {
      ok: false,
      message: `${fileName} isn't in WGS84. Its coordinates run from ${Math.round(west)} to ${Math.round(east)}, but GeoJSON uses longitude and latitude (EPSG:4326). Reproject it in QGIS or with ogr2ogr -t_srs EPSG:4326.`,
    };
  }

  const warnings: string[] = [];
  if (skipped > 0) warnings.push(`${skipped} feature${skipped === 1 ? "" : "s"} without geometry skipped.`);
  if (vertices > MAX_VERTICES) {
    warnings.push(
      `${vertices.toLocaleString()} vertices. Simplify it (mapshaper.org) or serve vector tiles to keep the map fast.`,
    );
  }

  return {
    ok: true,
    value: { data: { type: "FeatureCollection", features: kept }, counts, bounds: [west, south, east, north], warnings },
  };
}

export function unionBounds(list: Bounds[]): Bounds | null {
  if (list.length === 0) return null;
  return list.reduce<Bounds>(
    (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])],
    [...list[0]],
  );
}

/** "241 points", "25 polygons", "3 points, 2 lines". */
export function describeCounts(counts: Counts): string {
  const names: Record<Kind, [string, string]> = {
    point: ["point", "points"],
    line: ["line", "lines"],
    polygon: ["polygon", "polygons"],
  };
  return (Object.keys(names) as Kind[])
    .filter((k) => counts[k] > 0)
    .map((k) => `${counts[k].toLocaleString()} ${counts[k] === 1 ? names[k][0] : names[k][1]}`)
    .join(", ");
}

export const kindOfGeometry = (type: string): Kind => KIND_BY_TYPE[type] ?? "polygon";

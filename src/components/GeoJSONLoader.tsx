import { useEffect } from "react";
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

export type LoadedGeoJson = FeatureCollection<Geometry, GeoJsonProperties>;

type Props = {
  onLoad: (data: LoadedGeoJson) => void;
};

type GeoJsonObject = LoadedGeoJson | Feature<Geometry, GeoJsonProperties> | Geometry;

type GeoJsonWithType = {
  type: string;
};

const geojsonModules = import.meta.glob<string>("../data/*.geojson", {
  eager: true,
  import: "default",
  query: "?raw",
});

const geometryTypes = new Set([
  "Point",
  "MultiPoint",
  "LineString",
  "MultiLineString",
  "Polygon",
  "MultiPolygon",
  "GeometryCollection",
]);

function isGeoJson(value: unknown): value is GeoJsonObject {
  if (
    typeof value !== "object" ||
    value === null ||
    typeof (value as { type?: unknown }).type !== "string"
  ) {
    return false;
  }

  const { type } = value as GeoJsonWithType;

  return type === "FeatureCollection" || type === "Feature" || geometryTypes.has(type);
}

function toFeatures(
  data: GeoJsonObject,
  path: string,
): Array<Feature<Geometry, GeoJsonProperties>> {
  if (data.type === "FeatureCollection") {
    if (!Array.isArray(data.features)) {
      throw new Error(`${path} is missing GeoJSON features.`);
    }

    return data.features;
  }

  if (data.type === "Feature") {
    return [data];
  }

  return [
    {
      type: "Feature",
      properties: {},
      geometry: data,
    },
  ];
}

function readGeoJsonFiles(): LoadedGeoJson {
  const features = Object.entries(geojsonModules).flatMap(([path, rawData]) => {
    const data = JSON.parse(rawData);

    if (!isGeoJson(data)) {
      throw new Error(`${path} is not valid GeoJSON.`);
    }

    return toFeatures(data, path);
  });

  return {
    type: "FeatureCollection",
    features,
  };
}

export default function GeoJSONLoader({ onLoad }: Props) {
  useEffect(() => {
    onLoad(readGeoJsonFiles());
  }, [onLoad]);

  return null;
}

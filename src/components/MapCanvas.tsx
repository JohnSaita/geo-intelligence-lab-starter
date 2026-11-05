import { useMemo, useState } from "react";
import Map, { Layer, NavigationControl, ScaleControl, Source } from "react-map-gl/mapbox";
import type { MapMouseEvent, MapRef } from "react-map-gl/mapbox";
import type { RefObject } from "react";
import type { ExpressionSpecification } from "mapbox-gl";

import { BASEMAPS, HIGHLIGHT } from "../config";
import type { BasemapId } from "../config";
import type { LayerEntry } from "../hooks/useLayers";
import { kindOfGeometry } from "../lib/geojson";
import type { Kind } from "../lib/geojson";

export interface Selected {
  entryId: string;
  featureId: number;
  kind: Kind;
  props: Record<string, unknown>;
}

interface Props {
  token: string;
  mapRef: RefObject<MapRef | null>;
  layers: LayerEntry[];
  basemap: BasemapId;
  selected: Selected | null;
  onSelect: (s: Selected | null) => void;
  onLoad: () => void;
  onTokenRejected: () => void;
}

const FILL_OPACITY = 0.3;

// A circle layer also draws every vertex of lines and polygons. Restrict it to real points.
const POINTS_ONLY: ExpressionSpecification = ["==", ["geometry-type"], "Point"];
// Likewise a fill layer would shade the area between the vertices of a line.
const POLYGONS_ONLY: ExpressionSpecification = ["==", ["geometry-type"], "Polygon"];

export default function MapCanvas({
  token,
  mapRef,
  layers,
  basemap,
  selected,
  onSelect,
  onLoad,
  onTokenRejected,
}: Props) {
  const [cursor, setCursor] = useState("");
  const style = BASEMAPS.find((b) => b.id === basemap)?.style ?? BASEMAPS[0].style;

  const interactiveLayerIds = useMemo(
    () => layers.filter((l) => l.visible).flatMap((l) => [`${l.id}:circle`, `${l.id}:line`, `${l.id}:fill`]),
    [layers],
  );
  const attribution = useMemo(
    () => layers.map((l) => l.attribution).filter((a): a is string => Boolean(a)),
    [layers],
  );
  const selectedLayer = selected ? layers.find((l) => l.id === selected.entryId && l.visible) : undefined;

  const handleClick = (e: MapMouseEvent & { features?: unknown[] }) => {
    const f = (e.features as mapboxgl.GeoJSONFeature[] | undefined)?.[0];
    if (!f || typeof f.id !== "number") {
      onSelect(null);
      return;
    }
    onSelect({
      entryId: String(f.layer?.id ?? "").split(":")[0],
      featureId: f.id,
      kind: kindOfGeometry(f.geometry.type),
      props: (f.properties ?? {}) as Record<string, unknown>,
    });
  };

  const visibility = (l: LayerEntry) => ({ visibility: l.visible ? ("visible" as const) : ("none" as const) });

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      initialViewState={{ longitude: 37.9, latitude: 0.3, zoom: 4.6 }}
      mapStyle={style}
      style={{ width: "100%", height: "100%" }}
      customAttribution={attribution}
      interactiveLayerIds={interactiveLayerIds}
      cursor={cursor}
      onMouseEnter={() => setCursor("pointer")}
      onMouseLeave={() => setCursor("")}
      onClick={handleClick}
      onLoad={onLoad}
      onError={(e) => {
        const status = (e.error as { status?: number } | undefined)?.status;
        if (status === 401 || status === 403) onTokenRejected();
      }}
    >
      <NavigationControl position="bottom-right" showCompass={false} />
      <ScaleControl position="bottom-left" unit="metric" />

      {layers.map((l) => (
        <Source key={l.id} id={l.id} type="geojson" data={l.data} />
      ))}

      {/* Draw all polygons, then all lines, then all points, so points are never hidden under a fill. */}
      {layers.map((l) => (
        <Layer
          key={`${l.id}:fill`}
          id={`${l.id}:fill`}
          source={l.id}
          type="fill"
          filter={POLYGONS_ONLY}
          layout={visibility(l)}
          paint={{ "fill-color": l.color, "fill-opacity": FILL_OPACITY }}
        />
      ))}
      {layers.map((l) => (
        <Layer
          key={`${l.id}:line`}
          id={`${l.id}:line`}
          source={l.id}
          type="line"
          layout={{ ...visibility(l), "line-cap": "round", "line-join": "round" }}
          paint={{
            "line-color": l.color,
            "line-width": ["interpolate", ["linear"], ["zoom"], 4, 1, 12, 2.6],
          }}
        />
      ))}
      {layers.map((l) => (
        <Layer
          key={`${l.id}:circle`}
          id={`${l.id}:circle`}
          source={l.id}
          type="circle"
          filter={POINTS_ONLY}
          layout={visibility(l)}
          paint={{
            "circle-color": l.color,
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 3, 10, 6, 16, 9],
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1.5,
          }}
        />
      ))}

      {selected && selectedLayer && (
        <>
          <Layer
            id="selected:fill"
            source={selectedLayer.id}
            type="fill"
            filter={["all", POLYGONS_ONLY, ["==", ["id"], selected.featureId]]}
            paint={{ "fill-color": HIGHLIGHT, "fill-opacity": 0.35 }}
          />
          <Layer
            id="selected:line"
            source={selectedLayer.id}
            type="line"
            filter={["==", ["id"], selected.featureId]}
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{ "line-color": HIGHLIGHT, "line-width": 4 }}
          />
          <Layer
            id="selected:circle"
            source={selectedLayer.id}
            type="circle"
            filter={["all", POINTS_ONLY, ["==", ["id"], selected.featureId]]}
            paint={{
              "circle-color": "rgba(255,194,26,0.25)",
              "circle-radius": 13,
              "circle-stroke-color": HIGHLIGHT,
              "circle-stroke-width": 3,
            }}
          />
        </>
      )}
    </Map>
  );
}

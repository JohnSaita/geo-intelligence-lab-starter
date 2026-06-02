import { useRef, useState } from "react";
import Map, { Source, Layer } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import GeoJSONLoader from "./GeoJSONLoader";
import type { LoadedGeoJson } from "./GeoJSONLoader";
import LayerToggle from "./LayerToggle";
import ZoomControls from "./ZoomControls";

const emptyGeojsonData: LoadedGeoJson = {
  type: "FeatureCollection",
  features: [],
};
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapContainer() {
  const mapRef = useRef<MapRef>(null);
  const [geojsonData, setGeojsonData] =
    useState<LoadedGeoJson>(emptyGeojsonData);
  const [layerVisible, setLayerVisible] = useState(true);

  return (
    <div className="map-shell">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: 37,
          latitude: -1,
          zoom: 5,
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
      >
        <Source id="geojson" type="geojson" data={geojsonData}>
          {/* Points */}
          <Layer
            id="points-layer"
            type="circle"
            filter={[
              "any",
              ["==", ["geometry-type"], "Point"],
              ["==", ["geometry-type"], "MultiPoint"],
            ]}
            layout={{
              visibility: layerVisible ? "visible" : "none",
            }}
            paint={{
              "circle-radius": 6,
              "circle-color": "#007cbf",
            }}
          />

          {/* Lines */}
          <Layer
            id="lines-layer"
            type="line"
            filter={[
              "any",
              ["==", ["geometry-type"], "LineString"],
              ["==", ["geometry-type"], "MultiLineString"],
            ]}
            layout={{
              visibility: layerVisible ? "visible" : "none",
            }}
            paint={{
              "line-color": "#ff0000",
              "line-width": 3,
            }}
          />

          {/* Polygon boundaries */}
          <Layer
            id="polygon-boundaries"
            type="line"
            filter={[
              "any",
              ["==", ["geometry-type"], "Polygon"],
              ["==", ["geometry-type"], "MultiPolygon"],
            ]}
            layout={{
              visibility: layerVisible ? "visible" : "none",
            }}
            paint={{
              "line-color": "#374151",
              "line-width": 1.5,
            }}
          />
        </Source>
      </Map>

      <div className="map-controls map-controls--left">
        <ZoomControls
          zoomIn={() => mapRef.current?.zoomIn()}
          zoomOut={() => mapRef.current?.zoomOut()}
        />
      </div>

      <div className="map-controls map-controls--right">
        <LayerToggle visible={layerVisible} setVisible={setLayerVisible} />
      </div>

      <GeoJSONLoader onLoad={setGeojsonData} />
    </div>
  );
}

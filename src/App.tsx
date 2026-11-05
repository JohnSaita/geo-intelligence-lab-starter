import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef } from "react-map-gl/mapbox";

import Inspector from "./components/Inspector";
import MapCanvas from "./components/MapCanvas";
import type { Selected } from "./components/MapCanvas";
import Panel from "./components/Panel";
import TokenGate from "./components/TokenGate";
import WorkWithMe from "./components/WorkWithMe";
import type { BasemapId } from "./config";
import { useLayers } from "./hooks/useLayers";
import type { LayerEntry } from "./hooks/useLayers";
import { unionBounds } from "./lib/geojson";

const TOKEN: string = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

export default function App() {
  const tokenProblem = !TOKEN ? "missing" : TOKEN.startsWith("sk.") ? "secret" : !TOKEN.startsWith("pk.") ? "missing" : null;
  const [rejected, setRejected] = useState(false);

  if (tokenProblem) return <TokenGate problem={tokenProblem} />;
  if (rejected) return <TokenGate problem="rejected" />;
  return <Viewer onTokenRejected={() => setRejected(true)} />;
}

function Viewer({ onTokenRejected }: { onTokenRejected: () => void }) {
  const mapRef = useRef<MapRef>(null);
  const { layers, notices, addFiles, loadSamples, update, remove, dismissNotice } = useLayers();
  const [basemap, setBasemap] = useState<BasemapId>("light");
  const [selected, setSelected] = useState<Selected | null>(null);
  const [dragging, setDragging] = useState(false);
  const layersRef = useRef(layers);
  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  const fitTo = useCallback((list: LayerEntry[], duration = 1100) => {
    const bounds = unionBounds(list.map((l) => l.bounds));
    const map = mapRef.current;
    if (!bounds || !map) return;
    const narrow = window.innerWidth < 720;
    map.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      {
        maxZoom: 15,
        duration,
        padding: narrow
          ? { top: 70, bottom: Math.round(window.innerHeight * 0.5), left: 30, right: 30 }
          : { top: 90, bottom: 60, left: 400, right: 60 },
      },
    );
  }, []);

  const handleFiles = useCallback(
    async (files: File[]) => fitTo(await addFiles(files)),
    [addFiles, fitTo],
  );

  // Drop files anywhere on the page.
  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
    const enter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth++;
      setDragging(true);
    };
    const leave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const over = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const drop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      setDragging(false);
      void handleFiles(Array.from(e.dataTransfer?.files ?? []));
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragleave", leave);
    window.addEventListener("dragover", over);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("dragover", over);
      window.removeEventListener("drop", drop);
    };
  }, [handleFiles]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectedLayer = selected ? layers.find((l) => l.id === selected.entryId) : undefined;

  return (
    <div className="app">
      <MapCanvas
        token={TOKEN}
        mapRef={mapRef}
        layers={layers}
        basemap={basemap}
        selected={selected}
        onSelect={setSelected}
        onLoad={() => fitTo(layersRef.current, 0)}
        onTokenRejected={onTokenRejected}
      />

      <Panel
        layers={layers}
        notices={notices}
        basemap={basemap}
        onBasemap={setBasemap}
        onFiles={(files) => void handleFiles(files)}
        onSamples={() => void loadSamples().then((added) => fitTo(added))}
        onZoom={(l) => fitTo([l])}
        onUpdate={update}
        onRemove={(id) => {
          remove(id);
          setSelected((s) => (s?.entryId === id ? null : s));
        }}
        onDismiss={dismissNotice}
      />

      <WorkWithMe />

      {selected && selectedLayer && (
        <Inspector key={`${selected.entryId}:${selected.featureId}`} selected={selected} layer={selectedLayer} onClose={() => setSelected(null)} />
      )}

      {dragging && (
        <div className="dropveil" aria-hidden="true">
          <div>Drop to add to the map</div>
        </div>
      )}
    </div>
  );
}

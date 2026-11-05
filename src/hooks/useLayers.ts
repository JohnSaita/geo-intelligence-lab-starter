import { useCallback, useRef, useState } from "react";

import { PALETTE, SAMPLES } from "../config";
import { describeCounts, parseGeoJson, unsupportedFormat } from "../lib/geojson";
import type { Bounds, Counts, FC } from "../lib/geojson";

export interface LayerEntry {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  data: FC;
  counts: Counts;
  summary: string;
  bounds: Bounds;
  warnings: string[];
  attribution?: string;
}

export interface Notice {
  id: number;
  kind: "error" | "warning";
  text: string;
}

// Files in src/data load automatically, so "drop a file in the folder" still works.
const bundled = import.meta.glob<string>("../data/*.geojson", {
  eager: true,
  import: "default",
  query: "?raw",
});

const baseName = (path: string) =>
  (path.split("/").pop() ?? path).replace(/\.(geo)?json$/i, "");

function loadBundled() {
  const layers: LayerEntry[] = [];
  const notices: Notice[] = [];
  for (const [path, text] of Object.entries(bundled)) {
    const name = baseName(path);
    const result = parseGeoJson(text, `${name}.geojson`);
    if (!result.ok) {
      notices.push({ id: notices.length + 1, kind: "error", text: result.message });
      continue;
    }
    const { data, counts, bounds, warnings } = result.value;
    layers.push({
      id: `l${layers.length + 1}`,
      name,
      color: PALETTE[layers.length % PALETTE.length],
      visible: true,
      data,
      counts,
      summary: describeCounts(counts),
      bounds,
      warnings,
    });
  }
  return { layers, notices };
}

export function useLayers() {
  const [initial] = useState(loadBundled);
  const [layers, setLayers] = useState<LayerEntry[]>(initial.layers);
  const [notices, setNotices] = useState<Notice[]>(initial.notices);
  const counter = useRef(initial.layers.length);
  const noticeCounter = useRef(initial.notices.length);

  const pushNotice = useCallback((kind: Notice["kind"], text: string) => {
    noticeCounter.current += 1;
    const notice = { id: noticeCounter.current, kind, text };
    setNotices((list) => [...list.slice(-4), notice]);
  }, []);

  /** Parse text into a layer. Returns the new layer, or null after showing why it failed. */
  const addText = useCallback(
    (fileName: string, text: string, extra?: { name?: string; attribution?: string }) => {
      const result = parseGeoJson(text, fileName);
      if (!result.ok) {
        pushNotice("error", result.message);
        return null;
      }
      const { data, counts, bounds, warnings } = result.value;
      counter.current += 1;
      const entry: LayerEntry = {
        id: `l${counter.current}`,
        name: extra?.name ?? fileName.replace(/\.(geo)?json$/i, ""),
        color: PALETTE[(counter.current - 1) % PALETTE.length],
        visible: true,
        data,
        counts,
        summary: describeCounts(counts),
        bounds,
        warnings,
        attribution: extra?.attribution,
      };
      setLayers((list) => [...list, entry]);
      for (const w of warnings) pushNotice("warning", `${fileName}: ${w}`);
      return entry;
    },
    [pushNotice],
  );

  const addFiles = useCallback(
    async (files: File[]) => {
      setNotices([]);
      const added: LayerEntry[] = [];
      for (const file of files) {
        const problem = unsupportedFormat(file.name);
        if (problem) {
          pushNotice("error", problem);
          continue;
        }
        const entry = addText(file.name, await file.text());
        if (entry) added.push(entry);
      }
      return added;
    },
    [addText, pushNotice],
  );

  const loadSamples = useCallback(async () => {
    setNotices([]);
    const added: LayerEntry[] = [];
    try {
      for (const sample of SAMPLES) {
        const response = await fetch(`${import.meta.env.BASE_URL}samples/${sample.file}`);
        if (!response.ok) throw new Error(`${sample.file}: HTTP ${response.status}`);
        const entry = addText(sample.file, await response.text(), {
          name: sample.name,
          attribution: sample.attribution,
        });
        if (entry) added.push(entry);
      }
    } catch (error) {
      pushNotice("error", `Couldn't load the sample data (${error instanceof Error ? error.message : "network error"}).`);
    }
    return added;
  }, [addText, pushNotice]);

  const update = useCallback((id: string, patch: Partial<LayerEntry>) => {
    setLayers((list) => list.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const remove = useCallback((id: string) => {
    setLayers((list) => list.filter((l) => l.id !== id));
  }, []);

  const dismissNotice = useCallback((id: number) => {
    setNotices((list) => list.filter((n) => n.id !== id));
  }, []);

  return { layers, notices, addFiles, loadSamples, update, remove, dismissNotice };
}

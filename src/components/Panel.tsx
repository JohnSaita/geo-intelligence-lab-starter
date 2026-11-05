import { useRef } from "react";

import { BASEMAPS, BRAND } from "../config";
import type { BasemapId } from "../config";
import type { LayerEntry, Notice } from "../hooks/useLayers";
import logo from "../assets/gil-logo-horizontal-reversed.svg";
import { CloseIcon, CheckIcon, TargetIcon, UploadIcon } from "./Icons";

interface Props {
  layers: LayerEntry[];
  notices: Notice[];
  basemap: BasemapId;
  onBasemap: (id: BasemapId) => void;
  onFiles: (files: File[]) => void;
  onSamples: () => void;
  onZoom: (layer: LayerEntry) => void;
  onUpdate: (id: string, patch: Partial<LayerEntry>) => void;
  onRemove: (id: string) => void;
  onDismiss: (id: number) => void;
}

export default function Panel({
  layers,
  notices,
  basemap,
  onBasemap,
  onFiles,
  onSamples,
  onZoom,
  onUpdate,
  onRemove,
  onDismiss,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const empty = layers.length === 0;

  return (
    <aside className="panel" aria-label="Layers">
      <header className="panel__brand">
        <img className="panel__logo" src={logo} alt={BRAND.name} />
        <h1>{BRAND.product}</h1>
      </header>

      <div className="panel__body">
        {notices.length > 0 && (
          <ul className="notices" role="status">
            {notices.map((n) => (
              <li key={n.id} className={`notice notice--${n.kind}`}>
                <span>{n.text}</span>
                <button type="button" onClick={() => onDismiss(n.id)} aria-label="Dismiss message">
                  <CloseIcon width={14} height={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept=".geojson,.json,application/geo+json,application/json"
          onChange={(e) => {
            onFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />

        {empty ? (
          <section className="drop">
            <UploadIcon width={26} height={26} />
            <h2>Drop GeoJSON files anywhere on the map</h2>
            <p>Your data stays in your browser. Nothing is uploaded.</p>
            <button type="button" className="btn btn--primary" onClick={() => inputRef.current?.click()}>
              Choose files
            </button>
            <button type="button" className="link" onClick={onSamples}>
              Or try the Kajiado health facilities
            </button>
          </section>
        ) : (
          <section aria-labelledby="layers-title">
            <div className="section-head">
              <h2 id="layers-title">Layers</h2>
              <button type="button" className="btn btn--ghost" onClick={() => inputRef.current?.click()}>
                <UploadIcon width={15} height={15} /> Add files
              </button>
            </div>
            <ul className="layers">
              {layers.map((l) => (
                <li key={l.id} className="layer">
                  <label className="vis">
                    <input
                      type="checkbox"
                      checked={l.visible}
                      onChange={(e) => onUpdate(l.id, { visible: e.target.checked })}
                      aria-label={`Show ${l.name}`}
                    />
                    <span className="vis__box">
                      <CheckIcon width={13} height={13} strokeWidth={3} />
                    </span>
                  </label>
                  <input
                    className="swatch"
                    type="color"
                    value={l.color}
                    onChange={(e) => onUpdate(l.id, { color: e.target.value })}
                    aria-label={`Colour for ${l.name}`}
                  />
                  <div className="layer__text">
                    <strong title={l.name}>{l.name}</strong>
                    <span>{l.summary}</span>
                  </div>
                  <button type="button" className="icon-btn" onClick={() => onZoom(l)} aria-label={`Zoom to ${l.name}`}>
                    <TargetIcon width={17} height={17} />
                  </button>
                  <button type="button" className="icon-btn" onClick={() => onRemove(l.id)} aria-label={`Remove ${l.name}`}>
                    <CloseIcon width={17} height={17} />
                  </button>
                </li>
              ))}
            </ul>
            <p className="hint">Click a feature on the map to read its properties.</p>
          </section>
        )}

        <section aria-labelledby="basemap-title">
          <h2 id="basemap-title" className="section-title">
            Basemap
          </h2>
          <div className="segmented">
            {BASEMAPS.map((b) => (
              <button key={b.id} type="button" aria-pressed={basemap === b.id} onClick={() => onBasemap(b.id)}>
                {b.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      <footer className="panel__foot">
        <a href={BRAND.links.youtube} target="_blank" rel="noreferrer">
          {BRAND.tutorialsNote}
        </a>
        <a href={BRAND.links.source} target="_blank" rel="noreferrer">
          View source
        </a>
      </footer>
    </aside>
  );
}

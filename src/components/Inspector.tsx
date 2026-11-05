import { useState } from "react";

import type { LayerEntry } from "../hooks/useLayers";
import { CheckIcon, CloseIcon, CopyIcon } from "./Icons";
import type { Selected } from "./MapCanvas";

interface Props {
  selected: Selected;
  layer: LayerEntry;
  onClose: () => void;
}

const KIND_LABEL = { point: "Point", line: "Line", polygon: "Polygon" } as const;

const format = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : String(v));

export default function Inspector({ selected, layer, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const entries = Object.entries(selected.props);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(selected.props, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be blocked (insecure context); the table is still selectable.
    }
  };

  return (
    <section className="inspector" aria-label="Selected feature">
      <header>
        <div>
          <h2>{layer.name}</h2>
          <p>
            {KIND_LABEL[selected.kind]} {selected.featureId + 1} of {layer.counts[selected.kind].toLocaleString()}
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close feature details">
          <CloseIcon width={17} height={17} />
        </button>
      </header>

      {entries.length === 0 ? (
        <p className="inspector__empty">This feature has no properties.</p>
      ) : (
        <dl>
          {entries.map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{format(value)}</dd>
            </div>
          ))}
        </dl>
      )}

      {entries.length > 0 && (
        <button type="button" className="btn btn--ghost" onClick={copy}>
          {copied ? <CheckIcon width={15} height={15} /> : <CopyIcon width={15} height={15} />}
          {copied ? "Copied" : "Copy properties as JSON"}
        </button>
      )}
    </section>
  );
}

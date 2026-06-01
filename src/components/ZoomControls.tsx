type Props = {
  zoomIn: () => void;
  zoomOut: () => void;
};

export default function ZoomControls({ zoomIn, zoomOut }: Props) {
  return (
    <div className="zoom-controls" aria-label="Map zoom controls">
      <button className="map-button map-button--icon" onClick={zoomIn} aria-label="Zoom in">
        +
      </button>
      <button className="map-button map-button--icon" onClick={zoomOut} aria-label="Zoom out">
        -
      </button>
    </div>
  );
}

type Props = {
  visible: boolean;
  setVisible: (value: boolean) => void;
};

export default function LayerToggle({ visible, setVisible }: Props) {
  return (
    <button
      className="map-button layer-toggle"
      onClick={() => setVisible(!visible)}
      aria-pressed={visible}
    >
      {visible ? "Layer On" : "Layer Off"}
    </button>
  );
}

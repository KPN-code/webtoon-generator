export default function Panel({ panel }) {
  const { text, type, mood, camera } = panel;

  return (
    <div className={`panel ${type} ${mood}`}>
      <div className="image-area">
        <span className="camera-tag">{camera}</span>
      </div>

      <div className="text-area">
        {text}
      </div>
    </div>
  );
}
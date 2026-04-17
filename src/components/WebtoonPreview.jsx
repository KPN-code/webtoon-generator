export default function WebtoonPreview({ panels }) {
  if (!panels || panels.length === 0) {
    return (
      <div className="webtoon-container">
        <div className="preview-empty">
          Ready to Preview
        </div>
      </div>
    );
  }

  return (
    <div className="webtoon-container">
      {panels
        .filter((panel) => panel && panel.text) // 🔥 SUOJAUS
        .map((panel) => (
          <div
            key={panel.id}
            className={`panel ${panel.type || ""} ${panel.mood || ""}`}
          >
            {/* IMAGE */}
            <div className="image-area">
              {panel?.camera && (
                <span className="camera-tag">
                  {panel.camera}
                </span>
              )}
            </div>

            {/* TEXT */}
            <div className="text-area">
              {panel.text}
            </div>
          </div>
        ))}
    </div>
  );
}
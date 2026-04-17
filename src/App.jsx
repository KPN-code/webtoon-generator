import { useState } from "react";
import StoryInput from "./components/StoryInput";
import WebtoonPreview from "./components/WebtoonPreview";
import { splitStoryToPanels } from "./utils/splitStory";
import { v4 as uuidv4 } from "uuid";
import { generateWebtoon, generateStyle, generateWorld, generateCharacter } from "./api/bedrock";

export default function App() {
  const [panels, setPanels] = useState([]);
  const [activeTab, setActiveTab] = useState("story");
  const [loading, setLoading] = useState(false);
  const [loadingTab, setLoadingTab] = useState(null);

  const [styleSettings, setStyleSettings] = useState({ style: "", description: "", generatedText: "" });
  const [worldSettings, setWorldSettings] = useState({ name: "", description: "", extra: "", generatedText: "" });
  const [characters, setCharacters] = useState([
    { id: uuidv4(), name: "", description: "", extra: "", generatedText: "" },
  ]);

  // Generate story via AWS Lambda (Bedrock)
  async function handleGenerateStoryFromAPI(prompt) {
    setLoading(true);
    try {
      const resultText = await generateWebtoon(prompt);
      const split = splitStoryToPanels(resultText);
      setPanels(split);
    } catch (err) {
      console.error(err);
      alert("Webtoon generation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Generate style via Lambda
  async function handleGenerateStyle() {
    const prompt = [
      styleSettings.style && `Style: ${styleSettings.style}`,
      styleSettings.description && `Details: ${styleSettings.description}`,
    ].filter(Boolean).join("\n");

    if (!prompt.trim()) {
      alert("Please enter a style or description first.");
      return;
    }

    setLoadingTab("style");
    try {
      const resultText = await generateStyle(prompt);
      setStyleSettings((prev) => ({ ...prev, generatedText: resultText }));
    } catch (err) {
      alert("Style generation failed: " + err.message);
    } finally {
      setLoadingTab(null);
    }
  }

  // Generate world via Lambda
  async function handleGenerateWorld() {
    const prompt = [
      worldSettings.name && `World name: ${worldSettings.name}`,
      worldSettings.description && `Description: ${worldSettings.description}`,
      worldSettings.extra && `Extra: ${worldSettings.extra}`,
    ].filter(Boolean).join("\n");

    if (!prompt.trim()) {
      alert("Please enter world details first.");
      return;
    }

    setLoadingTab("world");
    try {
      const resultText = await generateWorld(prompt);
      setWorldSettings((prev) => ({ ...prev, generatedText: resultText }));
    } catch (err) {
      alert("World generation failed: " + err.message);
    } finally {
      setLoadingTab(null);
    }
  }

  // Generate character via Lambda
  async function handleGenerateCharacter(id) {
    const char = characters.find((c) => c.id === id);
    if (!char) return;

    const prompt = [
      char.name && `Name: ${char.name}`,
      char.description && `Description: ${char.description}`,
      char.extra && `Extra: ${char.extra}`,
    ].filter(Boolean).join("\n");

    if (!prompt.trim()) {
      alert("Please enter character details first.");
      return;
    }

    setLoadingTab(id);
    try {
      const resultText = await generateCharacter(prompt);
      setCharacters((prev) =>
        prev.map((c) => (c.id === id ? { ...c, generatedText: resultText } : c))
      );
    } catch (err) {
      alert("Character generation failed: " + err.message);
    } finally {
      setLoadingTab(null);
    }
  }

  function addCharacter() {
    setCharacters([
      ...characters,
      { id: uuidv4(), name: "", description: "", extra: "", generatedText: "" },
    ]);
  }

  function updateCharacter(id, field, value) {
    setCharacters(characters.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }

  function removeCharacter(id) {
    setCharacters(characters.filter((c) => c.id !== id));
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Webtoon Generator</h1>
      </header>

      <div className="layout">
        {/* LEFT SIDE */}
        <div className="left">
          {/* Tabs */}
          <div className="tabs">
            {["story", "style", "world", "characters"].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "tab active" : "tab"}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="tab-content">
            {activeTab === "story" && (
              <StoryInput onGenerate={handleGenerateStoryFromAPI} loading={loading} />
            )}

            {activeTab === "style" && (
              <div className="placeholder-tab">
                <h2>Art Style</h2>
                <input
                  className="input"
                  placeholder="Art style (e.g. Manga, Cartoon, Watercolor)"
                  value={styleSettings.style}
                  onChange={(e) => setStyleSettings({ ...styleSettings, style: e.target.value })}
                />
                <textarea
                  className="textarea"
                  placeholder="Describe style preferences, mood, color palette..."
                  value={styleSettings.description}
                  onChange={(e) =>
                    setStyleSettings({ ...styleSettings, description: e.target.value })
                  }
                />
                <button
                  className="generate-btn"
                  onClick={handleGenerateStyle}
                  disabled={loadingTab === "style"}
                >
                  {loadingTab === "style" ? "Generating..." : "Generate Style →"}
                </button>
                {styleSettings.generatedText && (
                  <div className="generated-text">
                    <strong>Generated Style:</strong>
                    <p>{styleSettings.generatedText}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "world" && (
              <div className="world-tab">
                <h2>World Building</h2>
                <input
                  className="input"
                  placeholder="World name"
                  value={worldSettings.name}
                  onChange={(e) => setWorldSettings({ ...worldSettings, name: e.target.value })}
                />
                <textarea
                  className="textarea"
                  placeholder="World description (geography, atmosphere, era...)"
                  value={worldSettings.description}
                  onChange={(e) =>
                    setWorldSettings({ ...worldSettings, description: e.target.value })
                  }
                />
                <textarea
                  className="textarea"
                  placeholder="Extra details (factions, magic systems, technology...)"
                  value={worldSettings.extra}
                  onChange={(e) => setWorldSettings({ ...worldSettings, extra: e.target.value })}
                />
                <button
                  className="generate-btn"
                  onClick={handleGenerateWorld}
                  disabled={loadingTab === "world"}
                >
                  {loadingTab === "world" ? "Generating..." : "Generate World →"}
                </button>
                {worldSettings.generatedText && (
                  <div className="generated-text">
                    <strong>Generated World:</strong>
                    <p>{worldSettings.generatedText}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "characters" && (
              <div className="placeholder-tab">
                <h2>Characters</h2>
                {characters.map((char) => (
                  <div key={char.id} className="character-card">
                    <div className="character-header">
                      <strong>Character</strong>
                      {characters.length > 1 && (
                        <button
                          className="remove-btn"
                          onClick={() => removeCharacter(char.id)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <input
                      className="input"
                      placeholder="Character name"
                      value={char.name}
                      onChange={(e) => updateCharacter(char.id, "name", e.target.value)}
                    />
                    <textarea
                      className="textarea"
                      placeholder="Description (appearance, personality...)"
                      value={char.description}
                      onChange={(e) => updateCharacter(char.id, "description", e.target.value)}
                    />
                    <textarea
                      className="textarea"
                      placeholder="Extra details (backstory, abilities...)"
                      value={char.extra}
                      onChange={(e) => updateCharacter(char.id, "extra", e.target.value)}
                    />
                    <button
                      className="generate-btn"
                      onClick={() => handleGenerateCharacter(char.id)}
                      disabled={loadingTab === char.id}
                    >
                      {loadingTab === char.id ? "Generating..." : "Generate Character →"}
                    </button>
                    {char.generatedText && (
                      <div className="generated-text">
                        <strong>Generated:</strong>
                        <p>{char.generatedText}</p>
                      </div>
                    )}
                  </div>
                ))}
                <button className="add-btn" onClick={addCharacter} disabled={!!loadingTab}>
                  + Add Character
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="right">
          {loading ? (
            <div className="preview-empty">Generating webtoon...</div>
          ) : panels.length === 0 ? (
            <div className="preview-empty">Ready to Preview</div>
          ) : (
            <WebtoonPreview panels={panels} />
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import StoryInput from "./components/StoryInput";
import WebtoonPreview from "./components/WebtoonPreview";
import { splitStoryToPanels } from "./utils/splitStory";
import { v4 as uuidv4 } from "uuid";
import { generateWebtoon } from "./api/bedrock"; // Bedrock Lambda API

export default function App() {
  const [panels, setPanels] = useState([]);
  const [activeTab, setActiveTab] = useState("story");
  const [loading, setLoading] = useState(false);

  const [styleSettings, setStyleSettings] = useState({ style: "", description: "" });
  const [worldSettings, setWorldSettings] = useState({ name: "", description: "", extra: "" });
  const [characters, setCharacters] = useState([
    { id: uuidv4(), name: "", description: "", extra: "", generatedText: "" },
  ]);

  // 🔹 Generate story locally
  function handleGenerateStoryLocal(story) {
    const split = splitStoryToPanels(story);
    const newPanels = split.map((text) => ({ id: uuidv4(), text }));
    setPanels(newPanels);
  }

  // 🔹 Generate story via AWS Lambda (Bedrock)
  async function handleGenerateStoryFromAPI(prompt) {
    setLoading(true);
    try {
      const resultText = await generateWebtoon(prompt); // data.text string
      const split = splitStoryToPanels(resultText);
      const newPanels = split.map((text) => ({ id: uuidv4(), text }));
      setPanels(newPanels);
    } catch (err) {
      console.error(err);
      alert("Webtoon generation failed via API");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Add new character
  function addCharacter() {
    setCharacters([
      ...characters,
      { id: uuidv4(), name: "", description: "", extra: "", generatedText: "" },
    ]);
  }

  // 🔹 Update character fields
  function updateCharacter(id, field, value) {
    setCharacters(characters.map(c => c.id === id ? { ...c, [field]: value } : c));
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
            {["story", "style", "world", "characters"].map(tab => (
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
              <StoryInput
                onGenerate={handleGenerateStoryFromAPI}
                loading={loading}
              />
            )}

            {activeTab === "style" && (
              <div className="placeholder-tab">
                <input
                  className="input"
                  placeholder="Art style (e.g. Manga, Cartoon)"
                  value={styleSettings.style}
                  onChange={(e) => setStyleSettings({ ...styleSettings, style: e.target.value })}
                />
                <textarea
                  className="textarea"
                  placeholder="Describe style preferences..."
                  value={styleSettings.description}
                  onChange={(e) => setStyleSettings({ ...styleSettings, description: e.target.value })}
                />
                <button disabled>
                  Generate Style (Lambda not implemented)
                </button>
              </div>
            )}

            {activeTab === "world" && (
              <div className="world-tab">
                <input
                  className="input"
                  placeholder="World name"
                  value={worldSettings.name}
                  onChange={(e) => setWorldSettings({ ...worldSettings, name: e.target.value })}
                />
                <textarea
                  className="textarea"
                  placeholder="World description"
                  value={worldSettings.description}
                  onChange={(e) => setWorldSettings({ ...worldSettings, description: e.target.value })}
                />
                <textarea
                  className="textarea"
                  placeholder="Extra details"
                  value={worldSettings.extra}
                  onChange={(e) => setWorldSettings({ ...worldSettings, extra: e.target.value })}
                />
                <button disabled>
                  Generate World (Lambda not implemented)
                </button>
              </div>
            )}

            {activeTab === "characters" && (
              <div className="placeholder-tab">
                {characters.map(char => (
                  <div key={char.id} className="character-card">
                    <input
                      className="input"
                      placeholder="Character name"
                      value={char.name}
                      onChange={(e) => updateCharacter(char.id, "name", e.target.value)}
                    />
                    <textarea
                      className="textarea"
                      placeholder="Description"
                      value={char.description}
                      onChange={(e) => updateCharacter(char.id, "description", e.target.value)}
                    />
                    <textarea
                      className="textarea"
                      placeholder="Extra details"
                      value={char.extra}
                      onChange={(e) => updateCharacter(char.id, "extra", e.target.value)}
                    />
                    {char.generatedText && (
                      <div className="generated-text">
                        <strong>Generated:</strong>
                        <p>{char.generatedText}</p>
                      </div>
                    )}
                  </div>
                ))}
                <button className="add-btn" onClick={addCharacter} disabled={loading}>+ Add Character</button>
                <button disabled>
                  Generate Characters (Lambda not implemented)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="right">
          {panels.length === 0 ? (
            <div className="preview-empty">Ready to Preview</div>
          ) : (
            <WebtoonPreview panels={panels} />
          )}
        </div>
      </div>
    </div>
  );
}
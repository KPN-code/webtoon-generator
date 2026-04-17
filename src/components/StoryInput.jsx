import { useState } from "react";

export default function StoryInput({ onGenerate, loading }) {
  const [story, setStory] = useState("");
  const [title, setTitle] = useState("");

  function fillExample() {
    setTitle("The Adventures of Pixel");
    setStory(
`Pixel wakes up in a strange digital world.

A glowing cube appears before him.

"Welcome, Pixel," it says.

Pixel looks around, confused but curious.`
    );
  }

  return (
    <div className="story-input">
      <h2>Create Your Story</h2>

      <input
        className="title-input"
        placeholder="e.g. The Adventures of Pixel"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="script-header">
        <span>Script</span>
        <button className="fill-btn" onClick={fillExample} disabled={loading}>
          Fill Example
        </button>
      </div>

      <textarea
        className="script-textarea"
        placeholder="Write your script... Separate panels with blank lines."
        value={story}
        onChange={(e) => setStory(e.target.value)}
        disabled={loading}
      />

      <button
        className="generate-btn"
        onClick={() => onGenerate(story)}
        disabled={loading || !story.trim()}
      >
        {loading ? "Generating..." : "Generate Webtoon →"}
      </button>
    </div>
  );
}

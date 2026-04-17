export function splitStoryToPanels(story) {
  // Split by double newlines first (paragraph-based), fall back to sentences
  let segments = story
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // If no paragraphs found, split by sentences
  if (segments.length <= 1) {
    segments = story
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  return segments.map((text, index) => ({
    id: crypto.randomUUID(),
    text,
    type: detectType(text),
    mood: detectMood(text),
    camera: getCamera(index),
  }));
}

function detectType(text) {
  if (text.includes('"') || text.includes('"') || text.includes('"')) return "dialogue";
  if (text.match(/run|jump|fight|grab|dash|strike|fly|explode/i)) return "action";
  return "narration";
}

function detectMood(text) {
  if (text.match(/angry|shout|fight|rage|furious/i)) return "intense";
  if (text.match(/sad|cry|tears|grief|loss/i)) return "sad";
  if (text.match(/laugh|smile|joy|happy|celebrate/i)) return "happy";
  return "calm";
}

function getCamera(index) {
  const cameras = ["close", "medium", "wide", "medium", "close"];
  return cameras[index % cameras.length];
}

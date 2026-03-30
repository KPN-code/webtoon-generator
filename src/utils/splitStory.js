export function splitStoryToPanels(story) {
  const sentences = story.split(/[.!?]/).filter(s => s.trim().length > 0);

  return sentences.map((sentence, index) => {
    const text = sentence.trim();

    return {
      id: crypto.randomUUID(),

      text,

      // 🧠 uusi logiikka
      type: detectType(text),
      mood: detectMood(text),
      camera: getCamera(index),
    };
  });
}

// 🔹 yksinkertainen heuristiikka
function detectType(text) {
  if (text.includes('"')) return "dialogue";
  if (text.match(/run|jump|fight|grab/i)) return "action";
  return "narration";
}

function detectMood(text) {
  if (text.match(/angry|shout|fight/i)) return "intense";
  if (text.match(/sad|cry/i)) return "sad";
  return "calm";
}

function getCamera(index) {
  const cameras = ["close", "medium", "wide"];
  return cameras[index % cameras.length];
}
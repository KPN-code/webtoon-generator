// bedrock.js
const API_URL = "https://ji8v80rfik.execute-api.eu-north-1.amazonaws.com/dev/items";

async function callLambda(prompt, type = "story") {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, type }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API request failed: ${res.status} ${text}`);
  }

  const data = await res.json();

  if (!data.text) {
    throw new Error("Malformed API response: missing 'text' field");
  }

  return data.text;
}

export async function generateWebtoon(prompt) {
  try {
    return await callLambda(prompt, "story");
  } catch (err) {
    console.error("Error in generateWebtoon:", err);
    throw err;
  }
}

export async function generateStyle(prompt) {
  try {
    return await callLambda(prompt, "style");
  } catch (err) {
    console.error("Error in generateStyle:", err);
    throw err;
  }
}

export async function generateWorld(prompt) {
  try {
    return await callLambda(prompt, "world");
  } catch (err) {
    console.error("Error in generateWorld:", err);
    throw err;
  }
}

export async function generateCharacter(prompt) {
  try {
    return await callLambda(prompt, "character");
  } catch (err) {
    console.error("Error in generateCharacter:", err);
    throw err;
  }
}
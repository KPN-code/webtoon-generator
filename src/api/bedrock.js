// bedrock.js
const API_URL = "https://ji8v80rfik.execute-api.eu-north-1.amazonaws.com/dev/items";

export async function generateWebtoon(prompt) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API request failed: ${res.status} ${text}`);
    }

    const data = await res.json();

    // Varmistetaan, että data.text on olemassa
    if (!data.text) {
      throw new Error("Malformed API response: missing 'text' field");
    }

    return data.text; // string, suoraan käytettävä App.jsx:ssa
  } catch (err) {
    console.error("Error in generateWebtoon:", err);
    throw err;
  }
}
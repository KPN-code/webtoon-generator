const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({
  region: process.env.MY_AWS_REGION || process.env.AWS_REGION || "eu-north-1",
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { prompt, type = "story" } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Missing 'prompt' in request body" }),
      };
    }

    // Build system prompt based on type
    const systemPrompts = {
      story: `You are a webtoon story writer. Given the user's story or idea, expand it into a compelling webtoon script.
Write 6-10 short panel descriptions separated by double newlines.
Each panel should have vivid, visual action or dialogue.
Format: one panel per paragraph. No numbering needed.`,

      style: `You are a webtoon art director. Describe the visual art style for a webtoon based on the user's input.
Output a short paragraph describing: color palette, line style, shading, and mood. Be specific and visual.`,

      world: `You are a webtoon worldbuilder. Create a rich world description based on the user's input.
Include: geography, atmosphere, key locations, and unique features. Be concise and visual.`,

      character: `You are a webtoon character designer. Create a character profile based on the user's input.
Include: appearance, personality, role in story, and a signature visual trait. Be concise.`,
    };

    const systemPrompt = systemPrompts[type] || systemPrompts.story;
    const modelId = process.env.BEDROCK_MODEL || "amazon.nova-lite-v1:0";

    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        system: [{ text: systemPrompt }],
        messages: [
          {
            role: "user",
            content: [{ text: prompt }],
          },
        ],
        inferenceConfig: {
          maxTokens: 1024,
          temperature: 0.8,
        },
      }),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(Buffer.from(response.body).toString());

    // Extract text from Nova/Bedrock response structure
    // Amazon Nova format: { output: { message: { content: [{ text: "..." }] } } }
    let extractedText = "";

    if (responseBody?.output?.message?.content?.[0]?.text) {
      extractedText = responseBody.output.message.content[0].text;
    } else if (responseBody?.content?.[0]?.text) {
      // Anthropic Claude on Bedrock format
      extractedText = responseBody.content[0].text;
    } else if (responseBody?.completion) {
      // Older Claude format
      extractedText = responseBody.completion;
    } else {
      console.error("Unknown response structure:", JSON.stringify(responseBody).slice(0, 500));
      throw new Error("Could not extract text from model response");
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ text: extractedText, type }),
    };
  } catch (err) {
    console.error("Lambda error:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || "Internal server error" }),
    };
  }
};
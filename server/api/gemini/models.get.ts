import { GoogleGenAI } from "@google/genai";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const apiKey = config.geminiApiKey;

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "API key is not configured",
    });
  }

  const client = new GoogleGenAI({ apiKey });

  try {
    const response = await client.models.list();
    // The response structure depends on the SDK version, print it to debug
    console.log("Available models:", JSON.stringify(response, null, 2));

    // @ts-expect-error response typing from genai SDK is not stable
    const models = response.models || response;

    return { models };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Gemini ListModels Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});

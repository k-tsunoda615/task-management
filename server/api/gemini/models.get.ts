import { GoogleGenAI } from "@google/genai";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const apiKey = config.geminiApiKey || process.env.NUXT_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

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

    // @ts-ignore
    const models = response.models || response; 

    return { models };
  } catch (error: any) {
    console.error("Gemini ListModels Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});

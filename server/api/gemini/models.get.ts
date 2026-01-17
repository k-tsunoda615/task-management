import { GoogleGenAI } from "@google/genai";

/**
 * Gemini のモデル一覧を取得する。
 * @description SDK の list 結果をそのまま返却する。
 * @returns {Promise<{ models: unknown }>} モデル一覧。
 */
const handler = async (): Promise<{ models: unknown }> => {
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
  } catch (error: unknown) {
    console.error("Gemini ListModels Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: (error as { message?: string }).message,
    });
  }
};

export default defineEventHandler(handler);

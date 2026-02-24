import { GoogleGenAI } from "@google/genai";
import type { H3Event } from "h3";

type GeminiChatHistoryItem = {
  /** 送信ロール */
  role?: string;
  /** パーツ配列 */
  parts?: Array<{
    /** テキスト本文 */
    text?: string;
  }>;
  /** 旧形式のテキスト本文 */
  text?: string;
};

type GeminiChatRequest = {
  /** 会話履歴 */
  history?: GeminiChatHistoryItem[];
  /** チャットメッセージ */
  message?: string;
  /** 単発プロンプト */
  prompt?: string;
  /** 利用モデル */
  model?: string;
};

type GeminiChatContentPart = {
  /** テキスト本文 */
  text: string;
};

type GeminiChatContent = {
  /** ロール */
  role: "user" | "model";
  /** 送信パーツ */
  parts: GeminiChatContentPart[];
};

/**
 * Gemini チャット/プロンプト API のハンドラー。
 * @description リクエスト形式に応じて Gemini API を呼び出す。
 * @param {H3Event} event - H3 のリクエストイベント。
 * @returns {Promise<{ text: string }>} 生成テキスト。
 */
const handler = async (event: H3Event): Promise<{ text: string }> => {
  const config = useRuntimeConfig();
  const apiKey = config.geminiApiKey;

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "API key is not configured",
    });
  }

  const body = (await readBody(event)) as GeminiChatRequest;
  const { history, message, prompt, model: userModel } = body;

  // 入力文字列の長さ制限
  const MAX_MESSAGE_LENGTH = 10000;
  if (message && message.length > MAX_MESSAGE_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `メッセージは${MAX_MESSAGE_LENGTH}文字以内にしてください`,
    });
  }
  if (prompt && prompt.length > MAX_MESSAGE_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `プロンプトは${MAX_MESSAGE_LENGTH}文字以内にしてください`,
    });
  }

  const client = new GoogleGenAI({ apiKey });

  // Default to gemini-2.5-flash if not specified
  const targetModel = userModel || "gemini-2.5-flash";

  try {
    if (history || message) {
      // Chat mode - history format might need adjustment for new SDK
      // Using generateContent with history as part of contents for stateless chat or creating a chat session
      // For now, let's use the simple generateContent with concatenated messages if chat session isn't obvious,
      // But looking at exports, there is a Chat class.
      // However, usually for REST-like usage, we just pass contents.
      // Let's interpret 'history' to build the contents array.

      let contents: GeminiChatContent[] = [];
      if (history && Array.isArray(history)) {
        // Transform history format from frontend
        // Frontend (AIChat.vue) sends: { role: 'user'|'model', parts: [{ text: '...' }] }
        contents = history.map((msg) => {
          // If frontend sends formatted parts
          if (msg.parts && Array.isArray(msg.parts) && msg.parts[0]?.text) {
            return {
              role: msg.role === "model" ? "model" : "user",
              parts: [{ text: msg.parts[0].text }],
            };
          }
          // If frontend sends simple text (fallback/legacy)
          return {
            role: msg.role === "model" ? "model" : "user",
            parts: [{ text: msg.text || "" }],
          };
        });
      }

      if (message) {
        contents.push({
          role: "user",
          parts: [{ text: message }],
        });
      }

      const response = await client.models.generateContent({
        model: targetModel,
        contents: contents,
      });

      return { text: response.text ?? "" };
    } else if (prompt) {
      // Single prompt mode
      const response = await client.models.generateContent({
        model: targetModel,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      return { text: response.text ?? "" };
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid request body",
      });
    }
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);

    // Handle Rate Limiting (429)
    if (
      (error as { status?: number }).status === 429 ||
      (error as { code?: number }).code === 429 ||
      (error as { message?: string }).message?.includes("429") ||
      (error as { message?: string }).message?.includes("quota")
    ) {
      // Try to extract retry delay from message like "Please retry in 59.071555733s."
      const match = (error as { message?: string }).message?.match(
        /Please retry in ([0-9.]+)s/
      );
      const retrySeconds = match ? Math.ceil(parseFloat(match[1] ?? "0")) : 60;

      throw createError({
        statusCode: 429,
        statusMessage: "Too Many Requests",
        message: `利用制限に達しました。約${retrySeconds}秒後に再試行してください。`,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: (error as { message?: string }).message,
    });
  }
};

export default defineEventHandler(handler);

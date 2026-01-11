import { GoogleGenAI } from "@google/genai";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.geminiApiKey;

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "API key is not configured",
    });
  }

  const body = await readBody(event);
  const { history, message, prompt, model: userModel } = body;

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
      
      let contents: any[] = [];
      if (history && Array.isArray(history)) {
         // Transform history format from frontend
         // Frontend (AIChat.vue) sends: { role: 'user'|'model', parts: [{ text: '...' }] }
         contents = history.map((msg: any) => {
           // If frontend sends formatted parts
           if (msg.parts && Array.isArray(msg.parts) && msg.parts[0]?.text) {
             return {
               role: msg.role === 'model' ? 'model' : 'user',
               parts: [{ text: msg.parts[0].text }]
             };
           }
           // If frontend sends simple text (fallback/legacy)
           return {
             role: msg.role === 'model' ? 'model' : 'user',
             parts: [{ text: msg.text || "" }]
           };
         });
      }
      
      if (message) {
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });
      }

      const response = await client.models.generateContent({
        model: targetModel,
        contents: contents,
      });

      return { text: response.text };
      
    } else if (prompt) {
      // Single prompt mode
      const response = await client.models.generateContent({
        model: targetModel,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return { text: response.text };
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid request body",
      });
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});

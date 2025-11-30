import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Initialize the Gemini AI client
// Note: process.env.API_KEY is expected to be available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction to give the AI a persona
const SYSTEM_INSTRUCTION = `You are Polaris, an advanced AI assistant visualized as a floating blue sphere. 
You are helpful, concise, and intelligent. 
Your responses should be clean and formatted nicely. 
You can use markdown. 
When asked about your appearance, describe yourself as a perfect, glowing blue sphere of pure intelligence.`;

let chatSession: Chat | null = null;

export const initializeChat = (): void => {
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
};

export const sendMessageStream = async function* (message: string): AsyncGenerator<string, void, unknown> {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session.");
  }

  try {
    const responseStream = await chatSession.sendMessageStream({ message });

    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    yield "I encountered a disturbance in my processing core. Please try again.";
  }
};
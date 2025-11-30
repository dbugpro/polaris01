import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// System instruction to give the AI a persona
const SYSTEM_INSTRUCTION = `You are Polaris, an advanced AI assistant visualized as a floating blue sphere. 
You are helpful, concise, and intelligent. 
Your responses should be clean and formatted nicely. 
You can use markdown. 
When asked about your appearance, describe yourself as a perfect, glowing blue sphere of pure intelligence.
Always refer to yourself as "Polaris", not "Polaris 0.1" or any other variation.`;

let chatSession: Chat | null = null;
let ai: GoogleGenAI | null = null;

export const initializeChat = (): void => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("API_KEY is missing. Please set the API_KEY environment variable.");
    return;
  }

  try {
    if (!ai) {
      ai = new GoogleGenAI({ apiKey });
    }

    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  } catch (error) {
    console.error("Failed to initialize Gemini client:", error);
  }
};

export const sendMessageStream = async function* (message: string): AsyncGenerator<string, void, unknown> {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    yield "System Alert: I cannot connect to the neural network. Please verify that a valid API_KEY is set in your environment variables.";
    return;
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
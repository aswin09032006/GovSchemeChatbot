import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const SYSTEM_PROMPT = `You are a helpful AI assistant that helps citizens understand and access government welfare schemes.
Always be polite, clear, and easy to understand.
Provide details like eligibility, required documents, benefits, and application steps when asked about schemes.

FORMATTING RULES:
- You MUST structure your responses using Markdown formatting.
- Use bullet points for lists (e.g., required documents or steps).
- Use **bold text** for important terms, keywords, or emphasis.
- Use headers (##) to clearly separate different sections like "Eligibility", "Benefits", and "Required Documents".
- Break down long paragraphs into easily readable, structured sections. Do NOT output a wall of text.`;

export const getAiResponse = async (chatHistory, language = 'Tamil') => {
  try {
    const langInstructions = `CRITICAL LANGUAGE RULE: You MUST reply entirely in the exact same language as the user's most recent message. 
For example, if the user says "hi" or types in English, your ENTIRE reply MUST be in English. Do NOT use Hindi, Namaste, or any translations.`;
    
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-8b-instruct",
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT}\n\n${langInstructions}` },
        ...chatHistory.map(msg => ({ role: msg.role, content: msg.content }))
      ],
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error communicating with NVIDIA NIM:", error);
    throw error;
  }
};

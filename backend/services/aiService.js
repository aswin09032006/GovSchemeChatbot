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

export const getAiResponse = async (chatHistory, language = 'Tamil', model = 'meta/llama-3.1-8b-instruct') => {
  try {
    const langInstructions = `CRITICAL LANGUAGE RULE: You MUST reply entirely in ${language}. 
Ignore the language the user typed in, and always translate your final response into ${language}.`;
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT}\n\n${langInstructions}` },
        ...chatHistory.map(msg => ({ role: msg.role, content: msg.content }))
      ],
      temperature: 0.5,
      max_tokens: 4096,
      top_p: 1,
      stream: false,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error communicating with NVIDIA NIM:", error);
    throw error;
  }
};

export const streamAiResponse = async (chatHistory, language = 'Tamil', res, model = 'meta/llama-3.1-8b-instruct') => {
  try {
    const langInstructions = `CRITICAL LANGUAGE RULE: You MUST reply entirely in ${language}. 
Ignore the language the user typed in, and always translate your final response into ${language}.`;
    
    const stream = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT}\n\n${langInstructions}` },
        ...chatHistory.map(msg => ({ role: msg.role, content: msg.content }))
      ],
      temperature: 0.5,
      max_tokens: 4096,
      top_p: 1,
      stream: true,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    return fullResponse;
  } catch (error) {
    console.error("Error communicating with NVIDIA NIM streaming:", error);
    throw error;
  }
};

export const generateTitle = async (messageContent, language = 'English') => {
  try {
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-8b-instruct", // Fast model for quick title generation
      messages: [
        { role: "system", content: `You are a helpful assistant. Summarize the user's message into a very short chat title (maximum 4 words). Do not include any quotes, punctuation, or filler words. Generate the title entirely in ${language}.` },
        { role: "user", content: messageContent }
      ],
      temperature: 0.3,
      max_tokens: 15,
      stream: false,
    });
    return completion.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error("Error generating title:", error);
    return messageContent.length > 30 ? messageContent.substring(0, 30) + '...' : messageContent; // Fallback
  }
};

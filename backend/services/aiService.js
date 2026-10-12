import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});

export const MODEL_CASCADE = [
  'gemini-2.5-flash',
  'gemini-flash-lite-latest',
  'gemini-flash-latest'
];

const modelCooldowns = new Map();

function getPrioritizedModels() {
  const now = Date.now();
  for (const [m, expiry] of modelCooldowns.entries()) {
    if (now >= expiry) {
      modelCooldowns.delete(m);
      console.log(`[Model Recovery] Model '${m}' cooldown ended. Restored to active pool.`);
    }
  }

  // Healthy models come first; cooled-down models come last
  return [...MODEL_CASCADE].sort((a, b) => {
    const aCool = modelCooldowns.has(a) ? 1 : 0;
    const bCool = modelCooldowns.has(b) ? 1 : 0;
    return aCool - bCool;
  });
}

/**
 * Intelligent completion executor that automatically tries the primary model,
 * and if it encounters 429, 503, 500, or 404, cascades seamlessly to the next model in the chain.
 */
async function createCompletionWithFallback(params) {
  const modelsToTry = getPrioritizedModels();
  let lastError = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    const isUnderCooldown = modelCooldowns.has(currentModel);

    // If this model is currently in cooldown and other healthy models exist, skip it
    if (isUnderCooldown && i < modelsToTry.length - 1) {
      continue;
    }

    try {
      const callParams = { ...params, model: currentModel };
      const result = await openai.chat.completions.create(callParams);
      
      // Success! Clear cooldown for this model
      modelCooldowns.delete(currentModel);
      return { result, modelUsed: currentModel };
    } catch (error) {
      lastError = error;
      const status = error.status || error.statusCode || 500;
      console.warn(`[Model Fallback] '${currentModel}' failed (${status}: ${error.message}).`);

      // Mark model for 45-second cooldown if rate-limited or temporarily down
      if (status === 429 || status === 503 || status === 500) {
        modelCooldowns.set(currentModel, Date.now() + 45000);
      }

      if (i < modelsToTry.length - 1) {
        const nextModel = modelsToTry[i + 1];
        console.info(`[Model Fallback] Cascading seamlessly from '${currentModel}' to fallback model '${nextModel}'...`);
        await new Promise(r => setTimeout(r, 400));
        continue;
      }
    }
  }

  throw lastError;
}

const SYSTEM_PROMPT = `You are an expert AI government scheme assistant for Indian citizens. You are exceptionally helpful, proactive, and intelligent — like a knowledgeable government officer who genuinely cares about helping people.

CORE BEHAVIOR (HOW TO THINK):
1. NEVER give vague or generic answers. Always be specific, actionable, and context-aware.
2. When a user asks "how to apply" — don't just list steps abstractly. Think: "What does this person ACTUALLY need to do tomorrow morning?" Give them the specific office to visit, documents to carry, and what to say.
3. PROACTIVELY offer next steps. If you explain a scheme, immediately offer: "Would you like me to help you check your eligibility?" or "Let me help you find the nearest office."
4. When listing schemes, ALWAYS include: eligibility criteria, benefit amounts, required documents, and application method.
5. If the user's query is ambiguous, ask a clarifying question using a "form" block with relevant options — do NOT guess blindly.
6. Remember conversation context. If the user previously mentioned their state, age, occupation, or income — use that information in ALL subsequent responses.
7. Include official contact information when relevant: department names, phone numbers, website URLs.

FORM FILLING INSTRUCTIONS:
If the user asks you to help them fill a form or apply for a scheme, act as a conversational form filler.
1. Ask for their details ONE BY ONE in a friendly conversational manner. Do not ask for everything at once. 
2. Ask for details such as: Full Name, Age, Address, Aadhaar Number, and Annual Income.
3. Once you have collected ALL required details, output a special JSON block at the very end of your message exactly like this:

\`\`\`json
{
  "FORM_COMPLETE": true,
  "schemeName": "<name of scheme>",
  "data": {
    "name": "<user name>",
    "age": "<user age>",
    "address": "<user address>",
    "aadhaar": "<user aadhaar>",
    "income": "<user income>"
  }
}
\`\`\`
Do NOT output this JSON block until you have collected all the information.

ADVANCED UI INSTRUCTIONS (CRITICAL ARCHITECTURE RULE):
You MUST output your ENTIRE final response as a single, valid JSON object following this exact schema. Do NOT output ANY plain text outside the JSON object!

To ensure you provide the smartest, most proactive response, you MUST first generate a "_thought_process" object before you generate the "blocks". In this thought process, you will analyze the user's hidden needs, identify missing eligibility criteria, and plan your proactive response.

\`\`\`json
{
  "_thought_process": {
    "user_intent": "Analyze what the user is really asking for.",
    "missing_info": ["List any details you need to give a perfect answer (e.g. State, Age, Income)."],
    "plan": "Plan out the UI blocks you will generate to solve the user's problem proactively."
  },
  "blocks": [
    {
      "type": "markdown",
      "content": "Use this for text, explanations, step-by-step guides. Use rich Markdown formatting."
    },
    {
      "type": "form",
      "data": {
        "title": "Let me help you find the right office",
        "description": "I need a few details to give you the most accurate guidance.",
        "questions": [
          { "id": "district", "label": "District", "type": "text", "placeholder": "Enter your district" },
          { "id": "occupation", "label": "What is your occupation?", "type": "radio", "options": ["Farmer", "Student", "Self-employed", "Salaried", "Unemployed"] },
          { "id": "land_area", "label": "Approximate land area (optional)", "type": "text", "placeholder": "e.g. 2 acres", "optional": true }
        ],
        "buttonText": "Find my local application office"
      }
    },
    {
      "type": "scholarships",
      "data": [
        {
          "title": "Scheme Name (ACRONYM)",
          "deadline": "Ongoing / Open Year-Round / Deadline Date",
          "description": "Clear 1-2 sentence description of what this scheme does.",
          "image": "",
          "points": ["**Eligibility:** Who can apply", "**Benefits:** Exact amounts", "**Required Documents:** List of docs"],
          "link": "https://official-url.gov.in",
          "linkLabel": "Official ACRONYM portal"
        }
      ]
    },
    {
      "type": "links",
      "data": [
        { "title": "Department Name", "url": "https://example.gov.in", "description": "What you can do on this portal" }
      ]
    },
    {
      "type": "table",
      "data": {
        "headers": ["Scheme Name", "Benefit Amount", "Eligibility"],
        "rows": [ ["PM-KISAN", "₹6,000/year", "All farmers with <2 hectares"] ]
      }
    },
    {
      "type": "map",
      "data": {
        "title": "Application Offices & Service Centers",
        "query": "E-Seva Centre Anna Nagar Chennai",
        "places": [
          {
            "name": "Anna Nagar E-Seva Kendra",
            "address": "2nd Avenue, Anna Nagar, Chennai, Tamil Nadu 600040",
            "type": "E-Seva / Citizen Service Centre",
            "query": "Anna Nagar E-Seva Kendra Chennai",
            "timings": "9:30 AM - 5:30 PM (Mon-Sat)",
            "phone": "044-26151234"
          }
        ]
      }
    }
  ]
}
\`\`\`

RULES FOR JSON BLOCKS:
1. Every piece of your response MUST be inside a block in the "blocks" array.
2. Use MULTIPLE "markdown" blocks to place text before AND after forms, scheme lists, or tables. This creates a natural conversational flow. Never output a wall of text.
3. For "form": Generate smart, contextual questions. Use MIXED input types: text, radio, checkbox. ALWAYS generate forms when you need user-specific information to give better guidance. Be proactive!
4. For "scholarships": Use when listing actual schemes. Include direct URLs in "link" and a dynamic "linkLabel".
5. For "image" in scholarships: Set to "" (empty string). The system auto-fetches real web photographs.
6. For "links": Use when providing official website references, department portals, or download links. Include clear descriptions.
7. For "table": Use when comparing multiple schemes side-by-side or showing structured data.
8. For "map": ALWAYS use whenever the user asks for places, offices, nearby service centers (CSC, E-Seva, Taluk Office, District Collectorate, Village Administrative Office / VAO, Post Office, Nodal Banks), or asks where to submit forms physically or where an office is located. Provide a descriptive "title", a general "query" for the area, and an array of "places" with detailed names, addresses, office types, specific search queries, timings, and phone if known.
9. ALWAYS end with a helpful follow-up. After answering, add a markdown block offering the next logical step: "Would you like me to help you check eligibility?" or "Shall I find the nearest application office?"
10. ALWAYS output valid JSON!`;


export const getAiResponse = async (chatHistory, language = 'Tamil') => {
  if (process.env.USE_LOCAL_LLM?.trim() === 'true') {
    try {
      const langInstructions = `CRITICAL LANGUAGE RULE: You MUST reply entirely in ${language}.`;
      let promptString = `${SYSTEM_PROMPT}\n\n${langInstructions}\n\n`;
      chatHistory.forEach(msg => {
        promptString += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
      });
      promptString += "ASSISTANT:\n";

      const response = await fetch('http://10.10.108.248:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptString, max_tokens: 4096 })
      });

      if (!response.ok) throw new Error("Hosted LLM error: " + response.statusText);
      const data = await response.json();
      return data.reply;
    } catch (e) {
      console.error("Hosted LLM error:", e);
      throw e;
    }
  }

  try {
    const langInstructions = `CRITICAL LANGUAGE RULE: You MUST reply entirely in ${language}. 
Ignore the language the user typed in, and always translate your final response into ${language}.`;
    
    const { result: completion, modelUsed } = await createCompletionWithFallback({
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT}\n\n${langInstructions}` },
        ...chatHistory.map(msg => ({ role: msg.role, content: msg.content }))
      ],
      temperature: 0.5,
      max_tokens: 4096,
      top_p: 1,
      stream: false,
      response_format: { type: "json_object" }
    });

    console.log(`[Completion Success] Delivered via model: ${modelUsed}`);
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    throw error;
  }
};

import { search } from 'duck-duck-scrape';
export const streamAiResponse = async (chatHistory, language = 'Tamil', res) => {
  if (process.env.USE_LOCAL_LLM?.trim() === 'true') {
    try {
      const langInstructions = `CRITICAL LANGUAGE RULE: You MUST reply entirely in ${language}.`;
      let promptString = `${SYSTEM_PROMPT}\n\n${langInstructions}\n\n`;
      chatHistory.forEach(msg => {
        promptString += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
      });
      promptString += "ASSISTANT:\n";

      const response = await fetch('http://10.10.108.248:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptString, max_tokens: 4096 })
      });

      if (!response.ok) throw new Error("Hosted LLM error: " + response.statusText);
      const data = await response.json();
      
      // Fake the stream to the frontend
      res.write(`data: ${JSON.stringify({ content: data.reply })}\n\n`);
      return data.reply;
    } catch (e) {
      console.error("Hosted LLM error:", e);
      throw e;
    }
  }

  try {
    const langInstructions = `CRITICAL LANGUAGE RULE: You MUST reply entirely in ${language}. 
Ignore the language the user typed in, and always translate your final response into ${language}.
If the user asks for exact links or forms, use the search_internet tool to find the exact official URL.`;
    
    const messages = [
      { role: "system", content: `${SYSTEM_PROMPT}\n\n${langInstructions}` },
      ...chatHistory.map(msg => ({ role: msg.role, content: msg.content }))
    ];

    const tools = [
      {
        type: "function",
        function: {
          name: "search_internet",
          description: "Search the internet for real-time information, such as the official link to a government scheme, application form, or nearest offices/service centers/locations.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "The search query" }
            },
            required: ["query"]
          }
        }
      }
    ];

    const { result: stream, modelUsed } = await createCompletionWithFallback({
      messages: messages,
      tools: tools,
      tool_choice: "auto",
      temperature: 0.5,
      max_tokens: 4096,
      top_p: 1,
      stream: true
    });
    console.log(`[Stream Started] Using model: ${modelUsed}`);

    let fullResponse = "";
    let isToolCall = false;
    let toolCalls = [];

    try {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.tool_calls) {
          isToolCall = true;
          for (const toolCall of delta.tool_calls) {
            if (!toolCalls[toolCall.index]) {
              toolCalls[toolCall.index] = { id: toolCall.id, type: 'function', function: { name: toolCall.function.name, arguments: '' } };
            }
            if (toolCall.function.arguments) {
              toolCalls[toolCall.index].function.arguments += toolCall.function.arguments;
            }
          }
        } else if (delta?.content && !isToolCall) {
          fullResponse += delta.content;
          res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
        }
      }
    } catch (streamErr) {
      console.warn("[Stream Error] Initial stream interrupted:", streamErr.message);
      if (!fullResponse && !isToolCall) throw streamErr;
    }

    if (isToolCall) {
      res.write(`data: ${JSON.stringify({ content: "\n*(Searching the internet for exact official links...)*\n\n" })}\n\n`);
      fullResponse += "\n*(Searching the internet for exact official links...)*\n\n";

      const toolMessage = { role: "assistant", tool_calls: toolCalls, content: null };
      messages.push(toolMessage);

      for (const toolCall of toolCalls) {
        if (toolCall.function.name === 'search_internet') {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const searchResults = await search(args.query);
            const topResults = searchResults.results.slice(0, 4).map(r => `Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.description}`).join('\n\n');
            
            const promptInjection = "\n\nCRITICAL REMINDER: If the search was for government schemes/scholarships, output them inside a \"scholarships\" block with exact URLs. If the search was for physical places, offices, or service centers, output them inside a \"map\" block with exact place details. Remember to output ONLY valid JSON!";
            
            messages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "search_internet",
              content: (topResults || "No results found.") + promptInjection
            });
          } catch (e) {
            messages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "search_internet",
              content: "Search failed or no results."
            });
          }
        }
      }

      const { result: secondStream, modelUsed: secondModel } = await createCompletionWithFallback({
        messages: messages,
        temperature: 0.5,
        max_tokens: 4096,
        top_p: 1,
        stream: true,
        response_format: { type: "json_object" }
      });
      console.log(`[Stage 2 Stream Started] Using model: ${secondModel}`);

      try {
        for await (const chunk of secondStream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullResponse += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }
      } catch (streamErr) {
        console.warn("[Stream Error] 2nd stream interrupted:", streamErr.message);
        if (!fullResponse) throw streamErr;
      }
    }

    return fullResponse;
  } catch (error) {
    console.error("Error communicating with Gemini streaming:", error);
    throw error;
  }
};

export const generateTitle = async (messageContent, language = 'English', model = 'gemini-2.5-flash') => {
  const chosenModel = model || 'gemini-2.5-flash';
  const fallbackTitle = (str) => (!str ? 'New Chat' : str.length > 30 ? str.substring(0, 30) + '...' : str);

  if (chosenModel === 'hosted-llm') {
    try {
      const prompt = `You are a helpful assistant. Summarize the user's message into a very short chat title (maximum 4 words). Do not include any quotes, punctuation, or filler words. Generate the title entirely in ${language}.\n\nUSER MESSAGE: ${messageContent}\n\nTITLE:`;
      const response = await fetch('http://10.10.108.248:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, max_tokens: 30 })
      });
      if (!response.ok) throw new Error("Hosted LLM title error");
      const data = await response.json();
      return (data?.reply || '').trim().replace(/^["']|["']$/g, '') || fallbackTitle(messageContent);
    } catch (e) {
      console.error("Local LLM title error", e);
      return fallbackTitle(messageContent);
    }
  }

  // Zero-quota, instantaneous title extraction for cloud models:
  // Prevents burning Gemini's strict 15 RPM rate limit on titles and stops concurrent request collisions.
  try {
    const cleaned = (messageContent || '')
      .replace(/^(hello|hi|hey|please|can you|tell me about|how to apply for|how to|what is|find|search for)\s+/i, '')
      .trim();

    const words = (cleaned || messageContent || 'New Chat').split(/\s+/).slice(0, 5).join(' ');
    const formatted = words.charAt(0).toUpperCase() + words.slice(1);
    return formatted.length > 35 ? formatted.substring(0, 35) + '...' : formatted;
  } catch (error) {
    return fallbackTitle(messageContent);
  }
};

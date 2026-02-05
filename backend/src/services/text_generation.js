import OpenAI from "openai";

// Chat completion endpoint (OpenAI-compatible mode)
// - Singapore: https://dashscope-intl.aliyuncs.com/compatible-mode/v1
// - US (Virginia): https://dashscope-us.aliyuncs.com/compatible-mode/v1
// - China (Beijing): https://dashscope.aliyuncs.com/compatible-mode/v1
const DASHSCOPE_COMPAT_BASE_URL =
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

let cachedClient = null;
function getChatClient() {
  const apiKey = process.env.DASHSCOPE_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing DASHSCOPE_API_KEY or OPENAI_API_KEY environment variable."
    );
  }
  // Lazy-init so the server can start even when AI keys are not configured.
  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey, baseURL: DASHSCOPE_COMPAT_BASE_URL });
  }
  return cachedClient;
}

/**
 * Basic Chat Completion
 * @param {string} userMessage - The user's message
 * @param {string} systemPrompt - Optional system prompt for context
 * @returns {Promise<string>} - The LLM's response
 */
export async function chatCompletion(
  userMessage,
  systemPrompt = "You are a helpful assistant."
) {
  try {
    const openaiChat = getChatClient();
    const response = await openaiChat.chat.completions.create({
      model: "qwen-plus", // or 'qwen-turbo', 'qwen-max', 'qwen-max-longcontext', etc.
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error calling DashScope API:", error);
    throw error;
  }
}

/**
 * Create a concise prompt for image generation based on article content.
 * @param {string} title - Article title
 * @param {string} content - Plain text content snippet
 * @returns {Promise<string>} - Image prompt
 */
export async function generateImagePromptFromArticle(title, content) {
  const systemPrompt =
    "You craft concise, vivid prompts for text-to-image generation. " +
    "Focus on concrete visual elements, style, mood, and composition. " +
    "Return a single sentence without quotes or markdown.";
  const userMessage =
    `Article title: ${title || "Untitled"}\n` +
    `Article content: ${content || ""}\n` +
    "Write a single-sentence image prompt that visually represents the article.";
  const raw = await chatCompletion(userMessage, systemPrompt);
  return (raw || "")
    .replace(/["`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Streaming Chat Completion
 * @param {string} userMessage - The user's message
 * @param {Function} onChunk - Callback function for each chunk
 */
export async function streamingChatCompletion(userMessage, onChunk) {
  try {
    const openaiChat = getChatClient();
    const stream = await openaiChat.chat.completions.create({
      model: "qwen-plus",
      messages: [{ role: "user", content: userMessage }],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error("Error in streaming:", error);
    throw error;
  }
}

/**
 * Chat with Conversation History
 * @param {Array} messages - Array of message objects with role and content
 * @returns {Promise<string>} - The LLM's response
 */
export async function chatWithHistory(messages) {
  try {
    const openaiChat = getChatClient();
    const response = await openaiChat.chat.completions.create({
      model: "qwen-plus",
      messages: messages,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error calling DashScope API:", error);
    throw error;
  }
}

/**
 * Function Calling / Tool Use
 * @param {string} userMessage - The user's message
 * @param {Array} tools - Array of available tools/functions
 * @returns {Promise<Object>} - The response with potential function calls
 */
export async function chatWithFunctions(userMessage, tools) {
  try {
    const openaiChat = getChatClient();
    const response = await openaiChat.chat.completions.create({
      model: "qwen-plus",
      messages: [{ role: "user", content: userMessage }],
      tools: tools,
      tool_choice: "auto",
    });

    return response.choices[0];
  } catch (error) {
    console.error("Error with function calling:", error);
    throw error;
  }
}

// Example usage:
/*
// Basic chat
const response = await chatCompletion("What is the capital of France?");
console.log(response);

// Streaming
await streamingChatCompletion("Tell me a story", (chunk) => {
  process.stdout.write(chunk);
});

// With conversation history
const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Hello!" },
  { role: "assistant", content: "Hi! How can I help you today?" },
  { role: "user", content: "What was my first message?" },
];
const historyResponse = await chatWithHistory(messages);

// Function calling
const tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get the current weather in a location",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string", description: "City name" },
          unit: { type: "string", enum: ["celsius", "fahrenheit"] },
        },
        required: ["location"],
      },
    },
  },
];
const functionResponse = await chatWithFunctions(
  "What is the weather in Paris?",
  tools
);
*/

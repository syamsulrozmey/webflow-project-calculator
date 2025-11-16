import { ApiError } from "@/lib/http";

interface ChatCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionOptions {
  model: string;
  messages: ChatCompletionMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: {
    type: "json_object" | "json_schema" | "text";
  };
}

interface OpenRouterChoice {
  message?: {
    content?: string | Array<{ type: string; text?: string }>;
  };
}

interface OpenRouterResponse {
  choices?: OpenRouterChoice[];
  error?: {
    message?: string;
  };
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const getReferer = () =>
  process.env.OPENROUTER_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://webflow-calculator.local";

const getAppName = () =>
  process.env.OPENROUTER_APP_NAME || "Webflow Project Calculator";

export async function callOpenRouterChat({
  model,
  messages,
  temperature = 0.2,
  maxTokens = 900,
  responseFormat,
}: ChatCompletionOptions): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new ApiError("OpenRouter API key is not configured.", 503);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "HTTP-Referer": getReferer(),
    "X-Title": getAppName(),
  };

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      messages,
      ...(responseFormat ? { response_format: responseFormat } : {}),
    }),
  });

  const raw = await response.text();
  let payload: OpenRouterResponse | null = null;
  try {
    payload = raw ? (JSON.parse(raw) as OpenRouterResponse) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.error?.message ??
      (raw?.trim() || `OpenRouter request failed with status ${response.status}`);
    throw new ApiError(message, response.status);
  }

  if (!payload) {
    throw new ApiError("OpenRouter returned an empty response.", 502);
  }
  const messageContent = payload.choices?.[0]?.message?.content;

  if (!messageContent) {
    throw new ApiError("OpenRouter returned an empty response.", 502);
  }

  if (typeof messageContent === "string") {
    return messageContent.trim();
  }

  const merged = messageContent
    .map((chunk) => chunk.text?.trim())
    .filter(Boolean)
    .join("\n");

  if (!merged) {
    throw new ApiError("OpenRouter returned no textual content.", 502);
  }

  return merged;
}



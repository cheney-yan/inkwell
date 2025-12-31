import { StoryConfig } from "./types";

export const generateCompletion = async (
  config: StoryConfig,
  messages: { role: "system" | "user" | "assistant"; content: string }[]
) => {
  if (!config.apiKey) {
    throw new Error("API Key is missing. Please configure it in settings.");
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to generate text");
  }

  const data = await response.json();
  return data.choices[0].message.content;
};
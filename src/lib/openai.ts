import { StoryConfig } from "./types";

export const generateCompletion = async (
  config: StoryConfig,
  messages: { role: "system" | "user" | "assistant"; content: string }[]
) => {
  if (!config.apiKey) {
    throw new Error("API Key is missing. Please configure it in settings.");
  }

  try {
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
      let errorDetails = `Status: ${response.status} ${response.statusText}`;
      
      try {
        const errorJson = await response.json();
        
        // Handle standard OpenAI error format
        if (errorJson.error) {
             const { message, type, code } = errorJson.error;
             if (message) errorDetails += `\nMessage: ${message}`;
             if (type) errorDetails += `\nType: ${type}`;
             if (code) errorDetails += `\nCode: ${code}`;
        } else {
            // Handle other JSON error formats
            errorDetails += `\nResponse: ${JSON.stringify(errorJson, null, 2)}`;
        }
      } catch (jsonError) {
        // If JSON parsing fails, try to read text
        try {
            const text = await response.text();
            if (text) errorDetails += `\nResponse: ${text.slice(0, 500)}`;
        } catch (e) {
            // Ignore text reading errors
        }
      }
      
      throw new Error(errorDetails);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    // If it's already our formatted error, rethrow. Otherwise format it.
    if (error.message && error.message.includes("Status:")) {
        throw error;
    }
    // Handle network errors (e.g. offline)
    throw new Error(`Network/Request Error: ${error.message}`);
  }
};
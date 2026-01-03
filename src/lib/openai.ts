import { StoryConfig } from "./types";
import { toast } from "sonner";

export const checkBackendHealth = async (): Promise<{ available: boolean; hasApiKey: boolean; model?: string }> => {
  try {
    const response = await fetch("/api/health", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (response.ok) {
      const data = await response.json();
      return { 
        available: true, 
        hasApiKey: data.hasApiKey,
        model: data.model 
      };
    }
    return { available: false, hasApiKey: false };
  } catch {
    return { available: false, hasApiKey: false };
  }
};

export const generateCompletion = async (
  config: StoryConfig,
  messages: { role: "system" | "user" | "assistant"; content: string }[]
) => {
  // Determine if we should use the backend server (Vercel API routes)
  // Use backend if: explicitly enabled OR no API key provided
  const useBackend = config.useBackendServer || !config.apiKey;
  
  // Show privacy warning when using backend
  if (useBackend) {
    toast.warning("Using default backend model. Your chat messages may not be private.", {
      id: "backend-privacy-warning",
      duration: 5000,
    });
  }
  
  const targetUrl = useBackend 
    ? "/api/chat"
    : `${config.baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Only add Authorization header if using direct API (user's own key)
  if (!useBackend) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }

  const body = {
    messages,
    temperature: 0.7,
    ...(useBackend ? {} : { model: config.model }),
  };

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = `API Error (${response.status})`;
      
      if (responseData?.error?.message) {
        errorMessage = responseData.error.message;
      } else if (responseData?.error) {
        errorMessage = JSON.stringify(responseData.error);
      }
      
      throw new Error(errorMessage);
    }

    if (!responseData?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from API");
    }

    return responseData.choices[0].message.content;
  } catch (error: any) {
    // Handle network errors for backend
    if (error.message === "Failed to fetch") {
      if (useBackend) {
        throw new Error(
          "Backend server is not available.\n\n" +
          "Options:\n" +
          "1. Run the backend: npm run dev:server\n" +
          "2. Or configure your own API key in Settings > API Config"
        );
      } else {
        throw new Error(
          "Could not connect to OpenAI API.\n\n" +
          "Check your internet connection and API settings."
        );
      }
    }
    
    throw error;
  }
};
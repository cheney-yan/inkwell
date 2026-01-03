import { StoryConfig } from "./types";
import { toast } from "sonner";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const checkBackendHealth = async (): Promise<{ available: boolean; hasApiKey: boolean; model?: string }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
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
  // Determine if we should use the backend server
  // Use backend if: explicitly enabled OR no API key provided
  const useBackend = config.useBackendServer || !config.apiKey;
  
  // Show privacy warning when using backend without explicit opt-in
  if (useBackend && !config.apiKey && !config.useBackendServer) {
    toast.warning("Using default backend model. Your chat messages are not private.", {
      id: "backend-privacy-warning", // Prevent duplicate toasts
      duration: 5000,
    });
  }
  
  const targetUrl = useBackend 
    ? `${BACKEND_URL}/api/chat/completions`
    : `${config.baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Only add Authorization header if using direct API
  if (!useBackend) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: useBackend ? undefined : config.model, // Backend uses its own model
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
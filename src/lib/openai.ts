import { StoryConfig } from "./types";
import { toast } from "sonner";

// Use relative path for API routes - works in both local dev and Vercel production
const getApiUrl = (path: string) => {
  // In production (Vercel), use relative path
  // In local dev with Vite, the proxy will handle it OR we fall back to direct backend
  return `/api/${path}`;
};

export const checkBackendHealth = async (): Promise<{ available: boolean; hasApiKey: boolean; model?: string }> => {
  try {
    const response = await fetch(getApiUrl("health"), {
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
    ? getApiUrl("chat")
    : `${config.baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Only add Authorization header if using direct API (user's own key)
  if (!useBackend) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: useBackend ? undefined : config.model,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      let errorDetails = `Status: ${response.status} ${response.statusText}`;
      
      try {
        const errorJson = await response.json();
        
        if (errorJson.error) {
             const { message, type, code } = errorJson.error;
             if (message) errorDetails += `\nMessage: ${message}`;
             if (type) errorDetails += `\nType: ${type}`;
             if (code) errorDetails += `\nCode: ${code}`;
        } else {
            errorDetails += `\nResponse: ${JSON.stringify(errorJson, null, 2)}`;
        }
      } catch (jsonError) {
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
    // Handle network errors for backend
    if (useBackend && error.message && error.message.includes("Failed to fetch")) {
      throw new Error(
        "Backend API is not available.\n\n" +
        "If running locally, make sure to run 'vercel dev' instead of 'npm run dev'.\n\n" +
        "Or configure your own API key in Settings > API Config."
      );
    }
    
    // If it's already our formatted error, rethrow
    if (error.message && error.message.includes("Status:")) {
        throw error;
    }
    
    // Handle other network errors
    throw new Error(`Network/Request Error: ${error.message}`);
  }
};
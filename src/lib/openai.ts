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
  // If no API key and not using backend server, show helpful error
  if (!config.apiKey && !config.useBackendServer) {
    throw new Error(
      "No API key configured.\n\n" +
      "Please go to Settings and either:\n" +
      "1. Enter your OpenAI API key in the API Config tab, or\n" +
      "2. Enable 'Use Backend Server' in the Backend Server tab (requires running the backend locally)"
    );
  }

  // Determine if we should use the backend server
  const useBackend = config.useBackendServer;
  
  // Show privacy warning when using backend
  if (useBackend) {
    toast.warning("Using backend server. Your chat messages may not be private.", {
      id: "backend-privacy-warning",
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
    // Handle network errors specifically for backend server
    if (useBackend && error.message && error.message.includes("Failed to fetch")) {
      throw new Error(
        "Backend server is not available.\n\n" +
        "To start the backend server:\n" +
        "1. Copy .env.example to .env\n" +
        "2. Add your OpenAI API key to .env\n" +
        "3. Run: npx tsx server/index.ts\n\n" +
        "Or disable 'Use Backend Server' in Settings and use your own API key."
      );
    }
    
    // If it's already our formatted error, rethrow
    if (error.message && (error.message.includes("Status:") || error.message.includes("No API key"))) {
        throw error;
    }
    
    // Handle other network errors
    throw new Error(`Network/Request Error: ${error.message}`);
  }
};
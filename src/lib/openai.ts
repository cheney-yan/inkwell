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
  // Use backend API if no client-side API key is configured
  const useBackend = !config.apiKey;
  
  if (useBackend) {
    toast.info("Using inkwell AI server - we suggest you configure your own API for better privacy control .", {
      id: "backend-info",
      duration: 5000,
    });
  }
  
  const targetUrl = useBackend 
    ? "/api/chat"
    : `${config.baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!useBackend) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }

  const body = {
    messages,
    temperature: 0.7,
    ...(useBackend ? {} : { model: config.model }),
  };

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
};
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from project root
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ 
    status: "ok", 
    hasApiKey: !!process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o"
  });
});

// Chat completions endpoint
app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o";

  console.log(`[/api/chat] Request received. API Key configured: ${!!apiKey}`);

  if (!apiKey) {
    console.error("[/api/chat] No API key configured");
    return res.status(500).json({
      error: {
        message: "Server API key not configured. Please set OPENAI_API_KEY in .env file.",
        type: "configuration_error",
        code: "missing_api_key"
      }
    });
  }

  try {
    const { messages, temperature = 0.7 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      console.error("[/api/chat] Invalid request: missing messages array");
      return res.status(400).json({
        error: {
          message: "Invalid request: messages array is required",
          type: "invalid_request_error"
        }
      });
    }

    console.log(`[/api/chat] Calling ${baseUrl} with model ${model}`);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[/api/chat] OpenAI API error: ${response.status} - ${errorText}`);
      
      try {
        const errorData = JSON.parse(errorText);
        return res.status(response.status).json(errorData);
      } catch {
        return res.status(response.status).json({
          error: {
            message: `OpenAI API error: ${response.status} ${response.statusText}`,
            type: "api_error"
          }
        });
      }
    }

    const data = await response.json();
    console.log(`[/api/chat] Success - received response`);
    res.json(data);
  } catch (error: any) {
    console.error("[/api/chat] Server error:", error.message);
    res.status(500).json({
      error: {
        message: error.message || "Internal server error",
        type: "server_error"
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Inkwell Backend Server`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   API Key: ${process.env.OPENAI_API_KEY ? "✓ Configured" : "✗ Missing (set OPENAI_API_KEY in .env)"}`);
  console.log(`   Model: ${process.env.OPENAI_MODEL || "gpt-4o"}\n`);
});
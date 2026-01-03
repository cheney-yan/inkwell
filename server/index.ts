import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    hasApiKey: !!process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o"
  });
});

// Chat completions endpoint
app.post("/api/chat/completions", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o";

  if (!apiKey) {
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
      return res.status(400).json({
        error: {
          message: "Invalid request: messages array is required",
          type: "invalid_request_error"
        }
      });
    }

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
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("API Error:", error);
    res.status(500).json({
      error: {
        message: error.message || "Internal server error",
        type: "server_error"
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Inkwell AI Server running on http://localhost:${PORT}`);
  console.log(`📝 API Key configured: ${process.env.OPENAI_API_KEY ? "Yes" : "No"}`);
  console.log(`🤖 Model: ${process.env.OPENAI_MODEL || "gpt-4o"}`);
});
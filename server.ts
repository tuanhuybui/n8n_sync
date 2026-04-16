import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy endpoint to bypass CORS
  app.post("/api/proxy-n8n", async (req, res) => {
    const { webhookUrl, authType, authHeaderName, authHeaderValue, authToken, message, history } = req.body;

    if (!webhookUrl) {
      return res.status(400).json({ error: "Webhook URL is required" });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authType === "header" && authHeaderName && authHeaderValue) {
      headers[authHeaderName] = authHeaderValue;
    } else if (authType === "bearer" && authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message,
          history: history.map((m: any) => ({ role: m.role, content: m.content })),
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
        res.status(response.status).json(data);
      } else {
        data = await response.text();
        // If it's plain text, wrap it in an object so the frontend can handle it consistently
        res.status(response.status).json({ output: data });
      }
    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: error.message || "Failed to connect to n8n" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Increase timeout to 5 minutes (300,000 ms) for long-running workflows
  server.setTimeout(300000);
  server.keepAliveTimeout = 300000;
  server.headersTimeout = 301000;
}

startServer();

import express from "express";
import cors from "cors";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MCP_INDEX = join(__dirname, "../mcp/index.js");

let mcpClient = null;

async function getMcpClient() {
  if (mcpClient) return mcpClient;
  const transport = new StdioClientTransport({
    command: "node",
    args: [MCP_INDEX],
  });
  const client = new Client(
    { name: "wikipedia-chat-backend", version: "1.0.0" },
    { capabilities: {} }
  );
  await client.connect(transport);
  mcpClient = client;
  return client;
}

function getTextContent(result) {
  if (!result.content || !Array.isArray(result.content)) return null;
  const textPart = result.content.find((c) => c.type === "text");
  return textPart ? textPart.text : null;
}

const QUESTION_PREFIXES = [
  "what is ",
  "what's ",
  "who is ",
  "who's ",
  "define ",
  "tell me about ",
  "explain ",
];

function getSearchQuery(message) {
  const trimmed = message.trim();
  let query = trimmed.toLowerCase();
  for (const prefix of QUESTION_PREFIXES) {
    if (query.startsWith(prefix)) {
      query = query.slice(prefix.length).trim();
      break;
    }
  }
  query = query.replace(/[?.!]+$/, "").trim();
  return query.length > 0 ? query : trimmed;
}

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const message = req.body?.message;
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Missing or invalid message" });
  }

  try {
    const client = await getMcpClient();
    const searchQuery = getSearchQuery(message.trim());

    const searchResult = await client.callTool({
      name: "search_wikipedia",
      arguments: { query: searchQuery },
    });

    const searchText = getTextContent(searchResult);
    if (!searchText) {
      return res.status(502).json({
        error: searchResult.isError ? searchText || "Search failed" : "No search results",
      });
    }
    if (searchResult.isError) {
      return res.status(502).json({ error: searchText });
    }

    let searchData;
    try {
      searchData = JSON.parse(searchText);
    } catch {
      return res.status(502).json({ error: "Invalid search response" });
    }

    const results = searchData.results || [];
    const first = results[0];
    if (!first || !first.title) {
      return res.status(404).json({ error: "No Wikipedia articles found for your query" });
    }

    const summaryResult = await client.callTool({
      name: "get_article_summary",
      arguments: { title: first.title },
    });

    const summaryText = getTextContent(summaryResult);
    if (!summaryText) {
      return res.status(502).json({
        error: summaryResult.isError ? summaryText || "Summary failed" : "No summary",
      });
    }
    if (summaryResult.isError) {
      return res.status(502).json({ error: summaryText });
    }

    let summaryData;
    try {
      summaryData = JSON.parse(summaryText);
    } catch {
      return res.status(502).json({ error: "Invalid summary response" });
    }

    const summary = summaryData.summary ?? "";
    const url = summaryData.url ?? first.url ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(first.title)}`;

    res.json({ summary, url });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

const PORT = Number(process.env.PORT) || 3001;
const server = app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Try: PORT=${PORT + 1} npm start`);
    process.exit(1);
  }
  throw err;
});

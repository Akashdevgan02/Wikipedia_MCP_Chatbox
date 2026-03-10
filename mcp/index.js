import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const WIKI_SEARCH_URL = "https://en.wikipedia.org/w/api.php";
const WIKI_SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";

const WIKI_HEADERS = {
  "User-Agent": "WikipediaMCPChat/1.0 (https://github.com; learning project)",
};

async function searchWikipedia(query) {
  const params = new URLSearchParams({
    action: "opensearch",
    search: query,
    limit: "5",
    format: "json",
    origin: "*",
    profile: "fuzzy",
  });
  const res = await fetch(`${WIKI_SEARCH_URL}?${params}`, { headers: WIKI_HEADERS });
  if (!res.ok) throw new Error(`Wikipedia search failed: ${res.status}`);
  const data = await res.json();
  const [searchTerm, titles, snippets, urls] = data;
  const results = (titles || []).map((title, i) => ({
    title,
    snippet: (snippets && snippets[i]) || "",
    url: (urls && urls[i]) || "",
  }));
  return results;
}

async function getArticleSummary(title) {
  const normalized = String(title).trim().replace(/\s+/g, "_");
  const encoded = encodeURIComponent(normalized);
  const res = await fetch(`${WIKI_SUMMARY_URL}/${encoded}`, { headers: WIKI_HEADERS });
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Article not found: ${title}`);
    throw new Error(`Wikipedia summary failed: ${res.status}`);
  }
  const data = await res.json();
  const extract = data.extract || "";
  const url =
    data.content_urls?.desktop?.page ||
    data.content_urls?.mobile?.page ||
    `https://en.wikipedia.org/wiki/${encoded}`;
  return { extract, url, title: data.title || title };
}

const server = new McpServer({
  name: "wikipedia-mcp-server",
  version: "1.0.0",
});

server.tool(
  "search_wikipedia",
  "Search Wikipedia for articles",
  { query: z.string() },
  async ({ query }) => {
    try {
      const results = await searchWikipedia(query);
      const text = JSON.stringify({ results }, null, 2);
      return { content: [{ type: "text", text }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Search error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_article_summary",
  "Get summary and URL for a Wikipedia article by title",
  { title: z.string() },
  async ({ title }) => {
    try {
      const { extract, url, title: articleTitle } = await getArticleSummary(title);
      const text = JSON.stringify({ summary: extract, url, title: articleTitle }, null, 2);
      return { content: [{ type: "text", text }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Summary error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

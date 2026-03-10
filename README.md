# Wikipedia MCP Chat

A chat application that lets you ask questions and get answers from Wikipedia. The backend uses a Wikipedia MCP (Model Context Protocol) server that exposes tools to search Wikipedia and fetch article summaries.

## Project structure

- **backend/** — Node.js + Express API that the frontend calls and that spawns and talks to the MCP server
- **mcp/** — Wikipedia MCP server (stdio) with `search_wikipedia` and `get_article_summary` tools
- **frontend/** — React chat UI (Vite)

## How to run locally

1. **Start the backend** (this also starts the MCP server when the first request is made):

   ```bash
   cd backend && npm install && npm start
   ```

   The backend listens on `http://localhost:3001` (override with `PORT`, e.g. `PORT=3002 npm start`).

2. **Start the frontend** (in another terminal):

   ```bash
   cd frontend && npm install && npm run dev
   ```

   Open the URL shown (e.g. `http://localhost:5173`).

3. In the chat UI, type a question (e.g. “What is photosynthesis?”) and click **Send**. You’ll see the Wikipedia summary and a “Read full article” link.

## Tech stack

- **Frontend:** React (Vite)
- **Backend:** Node.js, Express (default port 3001)
- **MCP server:** Node.js, `@modelcontextprotocol/sdk`
- **Data:** Wikipedia REST API (search + page summary)

## API

- `POST /api/chat` — Body: `{ "message": "your question" }`. Returns `{ "summary": "...", "url": "https://en.wikipedia.org/..." }` or `{ "error": "..." }`.

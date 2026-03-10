# Wikipedia MCP Chat App — MVP (Minimum Viable Product)

## MVP Goal

Deliver the smallest working version that proves the MCP flow end-to-end: the user asks a question in chat, the backend calls the MCP tools, and the user sees a Wikipedia summary and link. The MVP excludes non-essential features (e.g. rich search result picker, chat history, authentication) and focuses solely on demonstrating MCP integration.

---

## Core Features

- **Chat interface** — Input field and Send button (minimal UI to submit a query).
- **Wikipedia MCP server** — Basic implementation exposing only the two tools; no extra tools.
- **Tools:**
  - `search_wikipedia(query)`
  - `get_article_summary(title)`
- **Backend** — Receives chat requests and calls the MCP tools; returns tool results to the frontend.
- **Display** — Show article summary in the chat and a link to the full Wikipedia article (no advanced formatting or extra metadata required for MVP).

---

## User Flow

1. User enters a question or topic in the input and clicks Send.
2. Frontend sends the message to the backend.
3. Backend calls the MCP server (e.g. search then get summary for the first/top result, or get summary if title is inferred).
4. MCP server uses the Wikipedia API and returns data; backend forwards the response to the frontend.
5. Chat shows the article summary and a clickable link to the full article.

---

## MCP Tools Used

- **search_wikipedia(query)** — Used to find relevant article(s) for the user’s query; the MVP can use the first result.
- **get_article_summary(title)** — Used to fetch the summary and article URL to display in the chat.

These are the only two MCP tools required for the MVP; no additional tools are included.

---

## Success Criteria

- User can type in the chat input and send a message.
- Backend successfully invokes the MCP server’s `search_wikipedia` and/or `get_article_summary`.
- User sees the article summary in the chat response.
- User can open the full Wikipedia article via the provided link.
- End-to-end flow (UI → Backend → MCP Server → Wikipedia API) works without errors for a typical query.

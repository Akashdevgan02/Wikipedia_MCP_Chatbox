# Wikipedia MCP Chat App — UI Design

## UI Overview

The interface is a single-screen chat layout: a fixed header at the top, a scrollable message area in the middle, and a fixed input bar at the bottom. Users type in the input, click Send, and see their message and the bot’s Wikipedia-based response in the chat area.

---

## Components

| Component | Description |
|-----------|-------------|
| **Header title** | Displays "Wikipedia MCP Chat" at the top of the screen. |
| **Chat message area** | Scrollable region that shows the conversation (user and bot messages). |
| **User message bubble** | Bubble or block showing the user’s question (e.g. right-aligned or distinct style). |
| **Bot response bubble** | Bubble or block showing the article summary and link (e.g. left-aligned or distinct style). |
| **Input box** | Text field where the user types their question. |
| **Send button** | Button that submits the message and triggers the Wikipedia lookup. |

---

## ASCII Layout

```
+----------------------------------------------------------+
|  Wikipedia MCP Chat                                       |
+----------------------------------------------------------+
|                                                          |
|  +-----------------------------------------------+       |
|  | Bot: Here's a summary from Wikipedia...       |       |
|  | Photosynthesis is the process...              |       |
|  | [Read full article]                           |       |
|  +-----------------------------------------------+       |
|                                                          |
|                    +----------------------------------+   |
|                    | What is photosynthesis?         |   |
|                    +----------------------------------+   |
|                                                          |
|  +-----------------------------------------------+       |
|  | Bot: Summary for "Photosynthesis"...           |       |
|  | ...                                           |       |
|  | [Read full article]                           |       |
|  +-----------------------------------------------+       |
|                                                          |
+----------------------------------------------------------+
|  [ Type your question...                    ] [ Send ]   |
+----------------------------------------------------------+
```

- **Top:** Header with title "Wikipedia MCP Chat".
- **Middle:** Chat message area; bot messages on the left, user messages on the right (or stacked with clear labels).
- **Bottom:** Single row with input box and Send button.

---

## User Interaction Flow

1. **Open app** — User sees the header, empty (or initial) chat area, and input with Send.
2. **Type** — User enters a question in the input box (e.g. "What is photosynthesis?").
3. **Send** — User clicks Send (or presses Enter); the message is added to the chat as a user bubble.
4. **Loading** — Optionally, a loading indicator or placeholder appears where the bot reply will go.
5. **Response** — A bot bubble appears with the article summary and a "Read full article" (or similar) link.
6. **Scroll** — Chat area scrolls so the latest message is visible; user can scroll up to read history.
7. **Repeat** — User can type another question and send again; new user and bot bubbles append to the chat.

Flow is linear: type → send → see reply → type again. No extra screens or dialogs for the MVP.

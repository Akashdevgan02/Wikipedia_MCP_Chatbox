import { useState, useRef, useEffect } from "react";

const EXAMPLE_PROMPTS = [
  "What is photosynthesis?",
  "Who was Alan Turing?",
  "Define machine learning",
];

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14L21 3" />
    </svg>
  );
}

function WikipediaIcon() {
  return (
    <svg className="header-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16.5v-5H9l3-5.5 3 5.5h-2v5h-2zm1-7.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
    </svg>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendQuery = async (text, options = {}) => {
    const trimmed = text?.trim();
    if (!trimmed || loading) return;

    const { replaceLastN } = options;
    setInput("");

    if (replaceLastN != null && replaceLastN > 0) {
      setMessages((prev) => [...prev.slice(0, -replaceLastN), { role: "user", content: trimmed }]);
    } else {
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    }
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: data.error || "Something went wrong.", isError: true },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: data.summary || "",
          url: data.url,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Failed to get a response. Please try again.", isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuery(input);
  };

  const handleExampleClick = (prompt) => {
    sendQuery(prompt);
  };

  const handleRetry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    sendQuery(lastUser.content, { replaceLastN: 2 });
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <WikipediaIcon />
          <div>
            <h1>Wikipedia MCP Chat</h1>
            <p className="header-tagline">Ask anything, get summaries</p>
          </div>
        </div>
      </header>

      <div className="messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-badge">READY</div>
            <h2 className="empty-state-title">
              Query Wikipedia via <span className="empty-state-accent">MCP</span>
            </h2>
            <p className="empty-state-desc">
              Get short summaries and a link to the full article. Type below or pick an example.
            </p>
            <div className="example-chips-label">Try:</div>
            <div className="example-chips">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="example-chip"
                  onClick={() => handleExampleClick(prompt)}
                  disabled={loading}
                >
                  <span className="example-chip-caret">›</span>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`bubble ${msg.role === "user" ? "user" : "bot"} ${msg.isError ? "error" : ""}`}
          >
            <div className="bubble-content">
              {msg.content}
              {msg.url && (
                <a
                  href={msg.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="article-btn"
                >
                  <ExternalLinkIcon />
                  Read full article on Wikipedia
                </a>
              )}
              {msg.isError && (
                <div className="bubble-actions">
                  <button
                    type="button"
                    className="retry-btn"
                    onClick={handleRetry}
                    disabled={loading}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="bubble bot">
            <div className="bubble-content loading">
              <div className="loading-dots" aria-label="Loading">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          aria-label="Message"
        />
        <button type="submit" className="send-btn" disabled={loading} aria-label="Send">
          <SendIcon />
          Send
        </button>
      </form>
    </div>
  );
}

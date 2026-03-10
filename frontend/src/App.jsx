import { useState, useRef, useEffect } from "react";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: data.error || "Something went wrong." },
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
        { role: "bot", content: "Failed to get a response. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Wikipedia MCP Chat</h1>
      </header>

      <div className="messages">
        {messages.length === 0 && (
          <p className="placeholder">Ask a question to get a Wikipedia summary.</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`bubble ${msg.role === "user" ? "user" : "bot"}`}
          >
            <div className="bubble-content">
              {msg.content}
              {msg.url && (
                <a
                  href={msg.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="article-link"
                >
                  Read full article
                </a>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="bubble bot">
            <div className="bubble-content loading">Getting summary…</div>
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
        />
        <button type="submit" className="send-btn" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}

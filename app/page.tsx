"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';


type ChatMessage = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let storedId = localStorage.getItem("chat_session_id");
    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem("chat_session_id", storedId);
    }
    setSessionId(storedId);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          session_id: sessionId
        })
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer || "No response available."
      };

      setMessages(prev => [...prev, assistantMessage]);
      setInput("");
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Error fetching response" }
      ]);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-3xl flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">

        <header className="bg-blue-600 text-white p-4 flex justify-between items-center font-semibold text-lg shadow-sm">
          <span>OpenGIN Bot</span>
          <button
            onClick={() => {
              const newId = crypto.randomUUID();
              localStorage.setItem("chat_session_id", newId);
              setSessionId(newId);
              setMessages([]);
            }}
            className="text-xs bg-blue-500 hover:bg-blue-400 px-2 py-1 rounded transition"
          >
            New Session
          </button>
        </header>

        {/* Chat window */}
        <div className="flex-1 p-4 h-80 overflow-y-auto space-y-4 bg-gray-50">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 text-sm rounded-2xl shadow-sm transform transition-all duration-150 ${m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                  }`}
              >
                {/* Assistant pretty formatting */}
                {m.role === "assistant" ? (
                  <div className="markdown text-gray-800 leading-relaxed text-[14px] [&>table]:w-full [&>table]:border [&>table]:border-gray-300 [&>th]:bg-gray-100 [&>th]:p-2 [&>td]:p-2 [&>tr]:border-b [&>tr:last-child]:border-b-0 [&>p]:mb-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}


              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="flex p-4 gap-2 border-t border-gray-200 bg-white">
          <input
            className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question..."
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button
            className="bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700 shadow transition"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}

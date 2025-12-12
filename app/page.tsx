"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input })
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

        <header className="bg-blue-600 text-white p-4 text-center font-semibold text-lg shadow-sm">
          OpenGIN Bot
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
                  <div className="markdown text-gray-800 leading-relaxed text-[14px] [&>ul]:list-disc [&>ul]:ml-5 [&>p]:mb-2 [&>li]:mb-1 [&>strong]:text-black">
                    <ReactMarkdown>
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

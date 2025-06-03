// app/gemini/page.tsx
"use client";

import { useState } from "react";

export default function GeminiPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResponse("");

    const res = await fetch("/api/gemini", {
      method: "POST",
      body: JSON.stringify({ prompt }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    setLoading(false);
    if (data.text) setResponse(data.text);
    else setResponse("Lỗi: " + (data.error || "Không rõ"));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gemini Playground</h1>
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Nhập prompt của bạn..."
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded"
        disabled={loading}
      >
        {loading ? "Đang gửi..." : "Gửi Prompt"}
      </button>

      {response && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Phản hồi:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

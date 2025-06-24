import React from 'react';
import { useOpenAIChat } from '../hooks/useOpenAIChat';

interface OpenAIChatProps {
  initialGreeting?: string;
  apiKey?: string;
}

const OpenAIChat: React.FC<OpenAIChatProps> = ({ initialGreeting = "Hello! Ask me anything powered by OpenAI.", apiKey = "" }) => {
  const {
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage
  } = useOpenAIChat(initialGreeting, apiKey || "");

  return (
    <div className="max-w-xl mx-auto border border-gray-200 rounded-lg p-6 bg-white shadow-md">
      <div className="min-h-[200px] mb-4 space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={
            msg.role === 'user' ? 'text-blue-700' :
            msg.role === 'assistant' ? 'text-green-700' : 'text-gray-500'
          }>
            <span className="font-semibold mr-1">
              {msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'OpenAI' : 'System'}:
            </span>
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-gray-400">Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask OpenAI..."
          className="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={loading}
          onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:bg-blue-300"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default OpenAIChat;
import React, { useState } from 'react';
import { useOpenAIChat } from '../hooks/useOpenAIChat';

interface OpenAIChatProps {
  initialGreeting?: string;
  apiKey?: string;
}

const MODEL_OPTIONS = [
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'gpt-4', label: 'GPT-4' }
];

const OpenAIChat: React.FC<OpenAIChatProps> = ({ initialGreeting = "Hello! Ask me anything powered by OpenAI.", apiKey: initialApiKey = "" }) => {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].value);
  const {
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage,
    model,
    setModel
  } = useOpenAIChat(initialGreeting, apiKey, selectedModel);

  // Keep hook and local state in sync
  React.useEffect(() => { setModel(selectedModel); }, [selectedModel, setModel]);

  return (
    <div className="max-w-xl mx-auto border border-gray-200 rounded-lg p-6 bg-white shadow-md">
      <div className="mb-4 flex flex-col gap-2">
        <label className="font-semibold">OpenAI API Key:</label>
        <input
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={loading}
        />
        <label className="font-semibold mt-2">Model:</label>
        <select
          value={selectedModel}
          onChange={e => setSelectedModel(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={loading}
        >
          {MODEL_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
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
          disabled={loading || !input.trim() || !apiKey}
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:bg-blue-300"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default OpenAIChat;
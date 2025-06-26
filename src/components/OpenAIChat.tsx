import React, { useState } from 'react';
import { useOpenAIChat } from '../hooks/useOpenAIChat';

interface OpenAIChatProps {
  initialGreeting?: string;
  apiKey?: string;
}

const MODEL_OPTIONS = [
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'o1-mini', label: 'o1-mini' },
  { value: 'o3-mini', label: 'o3-mini' },
  { value: 'gpt-4o', label: 'GPT-4o' }
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
    setModel,
    clearChat
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
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="font-semibold">Model:</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            >
              {MODEL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={clearChat}
            disabled={loading}
            className="px-3 py-2 rounded bg-gray-500 text-white font-semibold disabled:bg-gray-300 hover:bg-gray-600"
          >
            Clear Chat
          </button>
        </div>
      </div>
      <div className="min-h-[300px] max-h-[500px] mb-4 space-y-3 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
        {messages.filter(msg => msg.role !== 'system').map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-800 border border-gray-200'
            }`}>
              <div className="text-xs font-semibold mb-1 opacity-70">
                {msg.role === 'user' ? 'You' : 'OpenAI'}
              </div>
              <div className="whitespace-pre-wrap break-words">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 p-3 rounded-lg">
              <div className="text-xs font-semibold mb-1 opacity-70">OpenAI</div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-100 text-red-700 border border-red-200 p-3 rounded-lg max-w-[80%]">
              <div className="text-xs font-semibold mb-1">Error</div>
              <div>{error}</div>
            </div>
          </div>
        )}
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

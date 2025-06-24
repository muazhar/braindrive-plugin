import { useState } from 'react';
import { OpenAIMessage, OpenAIChatRequest } from '../types/openai';
import { sendOpenAIChat } from '../services/openaiService';

export function useOpenAIChat(initialGreeting: string, apiKey: string) {
  const [messages, setMessages] = useState<OpenAIMessage[]>([
    { role: 'system', content: initialGreeting }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setLoading(true);
    setError('');
    try {
      const response = await sendOpenAIChat({ apiKey, prompt: input });
      if (response.choices && response.choices[0] && response.choices[0].message) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.choices[0].message.content }]);
      } else if (response.error) {
        setError(typeof response.error === 'string' ? response.error : response.error.message);
      } else {
        setError('Unexpected response from OpenAI');
      }
    } catch (e: any) {
      setError(e.message || 'Network error');
    }
    setInput('');
    setLoading(false);
  };

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage
  };
}
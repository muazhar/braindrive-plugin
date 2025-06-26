import { useState, useCallback } from 'react';
import { OpenAIMessage, OpenAIChatRequest } from '../types/openai';
import { sendOpenAIChat } from '../services/openaiService';

export function useOpenAIChat(initialGreeting: string, apiKey: string, initialModel: string) {
  const [messages, setMessages] = useState<OpenAIMessage[]>([
    { role: 'system', content: initialGreeting }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState(initialModel);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    if (!apiKey) {
      setError('Please enter your OpenAI API key');
      return;
    }

    const userMessage: OpenAIMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      // Prepare conversation history for API call
      // Filter out system messages for the API call, but keep user and assistant messages
      const conversationMessages = newMessages.filter(msg => msg.role !== 'system');
      
      const request: OpenAIChatRequest = {
        model,
        messages: conversationMessages,
        max_tokens: 1000,
        temperature: 0.7
      };

      const response = await sendOpenAIChat(request, apiKey);
      
      if (response.choices && response.choices[0] && response.choices[0].message) {
        const assistantMessage: OpenAIMessage = {
          role: 'assistant',
          content: response.choices[0].message.content
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else if (response.error) {
        setError(response.error.message);
      } else {
        setError('Unexpected response from OpenAI');
      }
    } catch (e: any) {
      setError(e.message || 'Network error occurred');
      // Remove the user message if there was an error
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }, [input, apiKey, model, messages]);

  const clearChat = useCallback(() => {
    setMessages([{ role: 'system', content: initialGreeting }]);
    setError('');
  }, [initialGreeting]);

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage,
    model,
    setModel,
    clearChat
  };
}

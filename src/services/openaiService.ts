import { OpenAIChatRequest, OpenAIChatResponse } from '../types/openai';

export async function sendOpenAIChat(request: OpenAIChatRequest): Promise<OpenAIChatResponse> {
  // The request now includes apiKey, prompt, and model
  const response = await fetch('/api/v1/openai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  return response.json();
}
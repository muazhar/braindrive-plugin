import { OpenAIChatRequest, OpenAIChatResponse } from '../types/openai';

export async function sendOpenAIChat(
  request: OpenAIChatRequest, 
  apiKey: string
): Promise<OpenAIChatResponse> {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  if (!apiKey.startsWith('sk-')) {
    throw new Error('Invalid API key format. OpenAI API keys start with "sk-"');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        max_tokens: request.max_tokens || 1000,
        temperature: request.temperature || 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data: OpenAIChatResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to communicate with OpenAI API');
  }
}

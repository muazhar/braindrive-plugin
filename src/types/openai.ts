export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIChatRequest {
  apiKey: string;
  prompt: string;
  model: string;
}

export interface OpenAIChatResponse {
  choices: { message: { role: string; content: string } }[];
  error?: { message: string } | string;
}
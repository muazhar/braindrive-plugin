import React from 'react';
import './ComponentOpenAIChat.css';
import { OpenAIMessage } from './types/openai';
import { sendOpenAIChat } from './services/openaiService';

interface ComponentOpenAIChatProps {
  initialGreeting?: string;
  apiKey?: string;
}

interface ComponentOpenAIChatState {
  apiKey: string;
  selectedModel: string;
  messages: OpenAIMessage[];
  input: string;
  loading: boolean;
  error: string | null;
  availableModels: { value: string; label: string }[];
}

/**
 * OpenAIChat component for chatting with OpenAI models
 */
class ComponentOpenAIChat extends React.Component<ComponentOpenAIChatProps, ComponentOpenAIChatState> {
  constructor(props: ComponentOpenAIChatProps) {
    super(props);
    this.state = {
      apiKey: props.apiKey || '',
      selectedModel: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: props.initialGreeting || 'Hello! Ask me anything powered by OpenAI.'
        }
      ],
      input: '',
      loading: false,
      error: null,
      availableModels: [
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        { value: 'gpt-4', label: 'GPT-4' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'o1-mini', label: 'o1-mini' },
        { value: 'o3-mini', label: 'o3-mini' },
        { value: 'gpt-4o', label: 'GPT-4o' }
      ]
    };
  }

  componentDidMount() {
    // Load available models from OpenAI API if API key is provided
    if (this.state.apiKey) {
      this.loadAvailableModels();
    }
  }

  componentDidUpdate(prevProps: ComponentOpenAIChatProps, prevState: ComponentOpenAIChatState) {
    // Reload models if API key changes
    if (prevState.apiKey !== this.state.apiKey && this.state.apiKey) {
      this.loadAvailableModels();
    }
  }

  loadAvailableModels = async () => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.state.apiKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const chatModels = data.data
          .filter((model: any) => model.id.includes('gpt') || model.id.includes('o1') || model.id.includes('o3'))
          .map((model: any) => ({
            value: model.id,
            label: model.id
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));

        if (chatModels.length > 0) {
          this.setState({ availableModels: chatModels });
        }
      }
    } catch (error) {
      // If loading models fails, keep the default models
      console.warn('Failed to load models from OpenAI API:', error);
    }
  };

  handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ apiKey: e.target.value });
  };

  handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ selectedModel: e.target.value });
  };

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ input: e.target.value });
  };

  handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      this.sendMessage();
    }
  };

  sendMessage = async () => {
    const { input, apiKey, selectedModel, messages } = this.state;
    
    if (!input.trim() || !apiKey || this.state.loading) {
      return;
    }

    const userMessage: OpenAIMessage = {
      role: 'user',
      content: input.trim()
    };

    const newMessages = [...messages, userMessage];
    this.setState({
      messages: newMessages,
      input: '',
      loading: true,
      error: null
    });

    try {
      const response = await sendOpenAIChat({
        model: selectedModel,
        messages: newMessages,
        max_tokens: 1000,
        temperature: 0.7
      }, apiKey);

      if (response.choices && response.choices.length > 0) {
        const assistantMessage: OpenAIMessage = {
          role: 'assistant',
          content: response.choices[0].message.content
        };

        this.setState({
          messages: [...newMessages, assistantMessage],
          loading: false
        });
      } else {
        throw new Error('No response from OpenAI');
      }
    } catch (error) {
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to send message'
      });
    }
  };

  clearChat = () => {
    const { initialGreeting } = this.props;
    this.setState({
      messages: [
        {
          role: 'system',
          content: initialGreeting || 'Hello! Ask me anything powered by OpenAI.'
        }
      ],
      input: '',
      error: null
    });
  };

  render() {
    const { apiKey, selectedModel, messages, input, loading, error, availableModels } = this.state;
    
    return (
      <div className="bd-openai-chat">
        <h3>OpenAI Chat</h3>
        
        <div className="config-section">
          <label className="label">OpenAI API Key:</label>
          <input
            type="password"
            value={apiKey}
            onChange={this.handleApiKeyChange}
            placeholder="sk-..."
            className="api-key-input"
            disabled={loading}
          />
          
          <div className="config-row">
            <div className="flex-1">
              <label className="label">Model:</label>
              <select
                value={selectedModel}
                onChange={this.handleModelChange}
                className="model-select"
                disabled={loading}
              >
                {availableModels.map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={this.clearChat}
              disabled={loading}
              className="clear-button"
            >
              Clear Chat
            </button>
          </div>
        </div>

        <div className="chat-container">
          {messages.filter(msg => msg.role !== 'system').map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className={`message-bubble ${msg.role}`}>
                <div className="message-header">
                  {msg.role === 'user' ? 'You' : 'OpenAI'}
                </div>
                <div>{msg.content}</div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="loading-indicator">
              <div className="loading-bubble">
                <div className="message-header">OpenAI</div>
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              <div className="error-bubble">
                <div className="message-header">Error</div>
                <div>{error}</div>
              </div>
            </div>
          )}
        </div>

        <div className="input-section">
          <input
            type="text"
            value={input}
            onChange={this.handleInputChange}
            onKeyDown={this.handleKeyDown}
            placeholder="Ask OpenAI..."
            className="message-input"
            disabled={loading}
          />
          <button
            onClick={this.sendMessage}
            disabled={loading || !input.trim() || !apiKey}
            className="send-button"
          >
            Send
          </button>
        </div>
      </div>
    );
  }
}

export default ComponentOpenAIChat;

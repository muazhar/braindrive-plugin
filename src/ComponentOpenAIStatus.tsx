import React from 'react';
import './ComponentOpenAIStatus.css';

type Status = 'online' | 'offline' | 'invalid_key' | 'unknown';

interface ComponentOpenAIStatusState {
  status: Status;
  apiKey: string;
  error: string | null;
}

/**
 * OpenAIStatus component for checking OpenAI API status and key validity
 */
class ComponentOpenAIStatus extends React.Component<{}, ComponentOpenAIStatusState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      status: 'unknown',
      apiKey: '',
      error: null
    };
  }

  async checkOpenAIStatus(apiKey: string) {
    this.setState({ status: 'unknown', error: null });
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      if (res.status === 401) {
        this.setState({ status: 'invalid_key', error: 'Invalid API Key' });
      } else if (res.ok) {
        this.setState({ status: 'online', error: null });
      } else {
        this.setState({ status: 'offline', error: `Error: ${res.status}` });
      }
    } catch (e) {
      this.setState({ status: 'offline', error: 'Network error' });
    }
  }

  handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ apiKey: e.target.value });
  };

  handleCheck = () => {
    if (this.state.apiKey) {
      this.checkOpenAIStatus(this.state.apiKey);
    }
  };

  render() {
    const { status, apiKey, error } = this.state;
    return (
      <div className="bd-openai-status">
        <h3>OpenAI API Status</h3>
        <div className="openai-key-input">
          <input
            type="password"
            placeholder="Enter OpenAI API Key"
            value={apiKey}
            onChange={this.handleApiKeyChange}
          />
          <button onClick={this.handleCheck} disabled={!apiKey}>Check</button>
        </div>
        <div className={`status ${status}`}>
          <span className="indicator" />
          <span>
            {status === 'online' && 'Online'}
            {status === 'offline' && 'Offline'}
            {status === 'invalid_key' && 'Invalid API Key'}
            {status === 'unknown' && 'Unknown'}
          </span>
        </div>
        {error && <div className="error">{error}</div>}
      </div>
    );
  }
}

export default ComponentOpenAIStatus;
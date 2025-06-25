# OpenAI Plugin

A BrainDrive plugin for real-time OpenAI API status and API key validity monitoring.

## Overview

The OpenAI Plugin provides API connectivity monitoring for BrainDrive services. It features a dashboard to track OpenAI API status and key validity, with simple configuration and installation options.

## Features

- **API Status Monitoring**: Check OpenAI API availability in real time
- **API Key Validation**: Instantly verify if your OpenAI API key is valid
- **Visual Dashboard**: Clear status indicators for API and key
- **Automatic Refresh**: Periodic status updates with configurable intervals
- **Error Handling**: Robust timeout and error feedback for API requests

## Installation

### From GitHub Releases (Recommended)

1. Go to the BrainDrive Plugin Manager
2. Click "Install Plugins"
3. Enter the repository URL: `https://github.com/azhar-ai-visnext/OpenAIPlugin`
4. Click "Install Plugin"

### Manual Installation

1. Download the latest release from GitHub
2. Extract the plugin files
3. Use the BrainDrive plugin installer or follow these steps:

```bash
# Copy to user plugin directory
cp -r plugins/OpenAIPlugin /path/to/braindrive/plugins/<user_id>/openaiplugin/
```

4. Run plugin initializer:

```python
from plugins.OpenAIPlugin.plugin_initializer import OpenAIInitializer

initializer = OpenAIInitializer()
await initializer.initialize(user_id, db_session)
```

### Prerequisites

- BrainDrive 1.0.0 or higher
- Node.js v18+
- Python 3.7+

## Configuration

### Plugin Settings

These can be configured via the plugin UI or a JSON file in the plugin data directory:

```json
{
  "refresh_interval": 30000
}
```

#### Supported Options

- **refresh_interval**: Auto-refresh interval in milliseconds (default: 30000)

## Module: OpenAI API Status Monitor

### Description

Real-time dashboard for monitoring OpenAI API status and API key validity.

### Features

- Live API status indicators
- API key validity check
- Visual feedback on status and errors

### Layout

- **Minimum Size**: 3x2 grid units
- **Default Size**: 4x3 grid units
- **Resizable**: Yes

## Development

### Project Structure

```
plugins/OpenAIPlugin/
├── src/
│   ├── ComponentOpenAIStatus.tsx
│   ├── index.tsx
│   ├── bootstrap.tsx
│   └── styles/
├── scripts/
│   ├── install.py
│   ├── validate.py
│   └── build.sh
├── dist/
├── plugin_initializer.py
├── package.json
├── webpack.config.js
├── tsconfig.json
└── tailwind.config.js
```

### Building and Running

```bash
# Install dependencies
npm install

# Dev mode
npm run dev

# Production build
npm run build

# Validate
npm run validate
# or
python3 scripts/validate.py
```

### Validation Checklist

- ✅ Required files and structure
- ✅ Plugin initializer logic
- ✅ TypeScript compile check
- ✅ React component structure
- ✅ Build artifacts verified
- ✅ OpenAI API check functionality tested

## Plugin Architecture

### Initializer Pattern

This plugin uses BrainDrive's initializer system for robust setup:

- Database registration
- Per-user plugin instance and directory setup
- Auto-cleanup on error
- Extensible with additional modules

### Key Components

- `plugin_initializer.py`: Registers plugin and modules, sets up environment
- `scripts/install.py`: Handles installation logic
- `scripts/validate.py`: Ensures build and setup correctness

## Permissions

- `network.read`: Read API status and perform health checks
- `storage.read`: Load plugin configuration and cached data
- `storage.write`: Save plugin settings and status history

## Technical Details

- **Bundle Method**: Webpack Module Federation
- **Entry Point**: `dist/remoteEntry.js`
- **Framework**: React 18+
- **Language**: TypeScript
- **Installation Type**: Remote or Manual

## Compatibility

- **BrainDrive Version**: 1.0.0+
- **Plugin API**: 1.0.0
- **Browser Support**: Modern browsers with ES2020+

## Troubleshooting

1. **Build Issues**
   Try cleaning and rebuilding:
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. **Validation Errors**
   Run:
   ```bash
   python3 scripts/validate.py
   ```

3. **API Problems**
   - Ensure your API key is correct
   - Check OpenAI status at [https://status.openai.com/](https://status.openai.com/)
   - Confirm network connectivity

## Contributing

1. Fork the repo
2. Create a feature branch
3. Implement your feature or fix
4. Run validation
5. Submit a pull request

## Version History

### v1.0.0

- Initial release
- Core OpenAI API status monitoring functionality
- API key validation
- Plugin validation and installation logic

## Support

- **GitHub Issues**: [https://github.com/azhar-ai-visnext/OpenAIPlugin/issues](https://github.com/azhar-ai-visnext/OpenAIPlugin/issues)
- **Repository**: [https://github.com/azhar-ai-visnext/OpenAIPlugin](https://github.com/azhar-ai-visnext/OpenAIPlugin)

## License

MIT License – see LICENSE file for details.

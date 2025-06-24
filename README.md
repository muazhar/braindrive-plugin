# OpenAI Plugin for BrainDrive

A BrainDrive plugin for interactive OpenAI-powered chat.

## Overview

OpenAIPlugin provides a chat interface powered by OpenAI's API. It features a modern UI, real-time responses, and is fully integrated with BrainDrive's plugin system.

## Features
- Chat with OpenAI models
- Clean, responsive UI (Tailwind CSS)
- TypeScript + React 18+
- Module Federation (Webpack)
- Easy configuration and extension

## Installation

### From BrainDrive Plugin Manager
1. Go to the BrainDrive Plugin Manager
2. Click "Install Plugins"
3. Enter the repository URL or copy the plugin folder
4. Click "Install Plugin"

### Manual
1. Copy this folder to your BrainDrive plugins directory
2. Install dependencies:
   ```
   npm install
   ```
3. Build the plugin:
   ```
   npm run build
   ```

## Development
- Dev mode: `npm run dev`
- Production build: `npm run build`

## Project Structure
```
OpenAIPlugin/
├── src/
│   ├── components/
│   │   └── OpenAIChat.tsx
│   ├── hooks/
│   │   └── useOpenAIChat.ts
│   ├── services/
│   │   └── openaiService.ts
│   ├── types/
│   │   └── openai.ts
│   ├── index.tsx
│   ├── index.css
│   └── bootstrap.tsx
├── public/
│   └── index.html
├── package.json
├── webpack.config.js
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── plugin.json
```

## Compatibility
- BrainDrive 1.0.0+
- Node.js v18+
- TypeScript 4+

## License
MIT
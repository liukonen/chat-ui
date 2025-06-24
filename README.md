# River Chatbot

A simple chatbot web application built with [Preact](https://preactjs.com/) and TypeScript. Users can chat with an AI-powered bot, with all messages displayed in a modern, responsive UI.

## Features

- Send and receive messages in real time
- Clean, glassmorphic UI styled with SASS and Bootstrap
- API endpoint configurable in code
- Fast, production-ready static build

## Getting Started

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd chat-ui
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Production Build

Build the optimized static site:

```bash
npm run build
```

The output will be in the `docs/` directory, ready for static hosting (e.g., GitHub Pages).

## Configuration

The chatbot API endpoint is set in [`src/page.tsx`](src/page.tsx):

```tsx
const response = await fetch(
  `https://ai.liukonen.dev?text=${encodeURIComponent(inputValue)}`
);
```

To use a different API, change the URL above.

## Project Structure

- [`src/`](src/) — Main source code (Preact + TypeScript + SASS)
- [`docs/`](docs/) — Production build output (static site)
- [`static/`](static/) — Static assets (favicon, HTML template, etc.)

## License

MIT License © 2023 Luke Liukonen
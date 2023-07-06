# Svelte Chatbot

This is a simple chatbot application built using Svelte. It allows users to interact with a chatbot and display the responses from an API.

## Features

- User can enter messages in the chatbox
- Chatbot responds with the API's response to the entered message
- Messages from both the user and chatbot are displayed in the chatbox

## Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Install the dependencies
```bash
   npm install
```

## Running the Applciation

   To start the application in development mode, run the following command:
```bash
    npm run dev
```
This will start the development server, and you can access the application at http://localhost:8080 in your browser.

## Building for Production
To build the application for production, run the following command:
```bash
    npm run build
```

This will generate optimized and minified files in the public directory.

## Customize the API Endpoint
By default, the chatbot is configured to call the API at bot.liukonen.dev. If you want to customize the API endpoint, you can modify the API_ENDPOINT constant in the App.svelte file.

```javascript
// App.svelte

const API_ENDPOINT = 'https://bot.liukonen.dev';
```
Replace 'bot.liukonen.dev' with your desired API endpoint URL.

## Contributing
Contributions are welcome! If you find any issues or want to add new features to the chatbot, please feel free to submit a pull request.

## License 

This project is licensed under the MIT License.
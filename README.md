# Chatty - AI Chat Application

Chatty is a Flask-based web application that connects to N8N webhooks to retrieve RAG (Retrieval-Augmented Generation) answers. The application allows users to have conversations with an AI assistant powered by your N8N webhook.

## Features

- Responsive chat interface
- Connection to N8N webhooks for retrieving AI responses
- User-configurable settings for webhook URL and authentication
- Modern, clean UI with Bootstrap 5

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/chatty.git
cd chatty
```

2. Create a virtual environment and activate it:

```bash
python -m venv venv
venv\Scripts\activate
```

3. Install the required packages:

```bash
pip install -r requirements.txt
```

## Configuration

Chatty stores configuration in the user session. You will need to set the following via the Settings page:

- N8N Webhook URL
- Username for webhook authentication
- Password for webhook authentication

## Running the Application

1. Start the Flask development server:

```bash
python app.py
```

2. Open your browser and navigate to `http://127.0.0.1:5000`

3. Configure your N8N webhook settings before using the chat

## N8N Webhook Requirements

Your N8N webhook should:

1. Accept POST requests with a JSON payload containing a `query` field
2. Support Basic Authentication (username/password)
3. Return a JSON response that can be displayed in the chat

## Development

To contribute to Chatty:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT

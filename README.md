# Chatty - AI Chat Application

Chatty is a Flask-based web application that connects to N8N webhooks to process user messages and retrieve AI-generated responses. It provides a clean, modern interface for conversational interactions with AI, using your configured N8N workflow as the backend processing engine.

![Chatty Screenshot](static/img/chatty-screenshot.png)

## Features

- Modern, responsive chat interface built with Bootstrap 5
- Real-time conversation with AI through N8N webhook integration
- Message formatting support including code blocks and links
- Secure session-based configuration storage
- User authentication for webhook requests
- Easy-to-use settings configuration panel
- Chat history with timestamp display
- Clear chat functionality
- Single-click launcher script (Chatty.bat) for easy startup

## System Requirements

- Python 3.7 or higher
- N8N instance with a configured webhook
- Modern web browser (Chrome, Firefox, Edge, Safari)

## Quick Start

For Windows users, we provide a single-click launcher:

1. Download and extract the Chatty application
2. Double-click the `Chatty.bat` file
3. The launcher will automatically:
   - Check if Python is installed
   - Set up a virtual environment
   - Install all required dependencies
   - Start the Flask server
   - Open your web browser to the application

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/chatty.git
cd chatty
```

2. Create a virtual environment (optional if using Chatty.bat):

```bash
python -m venv venv
venv\Scripts\activate  # On Windows
source venv/bin/activate  # On macOS/Linux
```

3. Install the required packages (optional if using Chatty.bat):

```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the root directory with your secret key:

```
SECRET_KEY=your-secure-secret-key
```

## Configuration

Chatty requires the following configuration, which can be set through the settings page:

- **N8N Webhook URL**: The complete URL to your N8N webhook endpoint
- **Username**: Authentication username for the webhook
- **Password**: Authentication password for the webhook

These settings are stored in the user's session and are used for all subsequent requests.

## Running the Application

### Option 1: Using the Launcher (Recommended for Windows)

1. Double-click the `Chatty.bat` file
2. The application will start automatically and open in your web browser

### Option 2: Manual Start

1. Start the Flask development server:

```bash
python app.py
```

2. Open your web browser and navigate to `http://127.0.0.1:5000`

3. Configure your N8N webhook settings before using the chat

## Using Chatty

1. **Initial Setup**:
   - When you first access Chatty, you'll be redirected to the Settings page
   - Enter your N8N webhook URL, username, and password
   - Click "Save Settings" to store your configuration

2. **Chatting with AI**:
   - Type your message in the input field at the bottom of the chat screen
   - Press Enter or click the Send button to submit your message
   - The AI's response will appear in the chat after processing
   - Messages are displayed with timestamps

3. **Managing Chat History**:
   - Click the "Clear Chat" button to remove all messages except the welcome message
   - Chat history persists only in the browser and is not stored on the server

## N8N Webhook Integration

Your N8N webhook should be configured to:

1. Accept POST requests with a JSON payload containing:
   - `chatInput`: The user's message text
   - `sessionId`: A unique identifier for the current chat session

2. Implement Basic Authentication with the username and password configured in Chatty

3. Return a JSON response in one of these formats:
   - `{"output": "AI response text"}` 
   - Any JSON object, which will be displayed as a response

Example N8N workflow:
```
[Webhook] → [HTTP Request to AI Service] → [Format Response] → [Return Response]
```

## Project Structure

- **app.py**: Main Flask application file with route definitions
- **templates/**: HTML templates using Jinja2
  - **layout.html**: Base template with common structure
  - **index.html**: Chat interface template
  - **settings.html**: Configuration form template
- **static/**: Static assets
  - **css/style.css**: Custom CSS styles
  - **js/script.js**: Frontend JavaScript functionality
- **flask_session/**: Session storage directory (automatically created)

## Troubleshooting

- **Error connecting to webhook**: Verify your webhook URL, username, and password in Settings
- **No response from AI**: Check your N8N workflow to ensure it's processing requests correctly
- **Import errors**: Ensure all dependencies are installed with the correct versions

## Dependencies

Chatty relies on the following key packages:
- Flask 2.0.3
- Werkzeug 2.0.3
- Flask-WTF 1.0.1
- Flask-Session 0.4.0
- Python-dotenv 1.0.0
- Requests 2.31.0

## Security Considerations

- Webhook credentials are stored in the user's session
- The application uses Flask-Session for server-side session storage
- The SECRET_KEY environment variable should be kept secure
- No user data is permanently stored on the server

## Development

To contribute to Chatty:

1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing code style
4. Submit a pull request with a detailed description of your changes

## License

MIT License 

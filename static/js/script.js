// Main chat functionality
function initChat() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const clearChatButton = document.getElementById('clear-chat');
    
    // Focus input on page load
    userInput.focus();
    
    // Send message when Send button is clicked
    sendButton.addEventListener('click', sendMessage);
    
    // Send message when Enter key is pressed
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Clear chat history
    clearChatButton.addEventListener('click', clearChat);
    
    // Scroll to bottom of chat
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Format timestamp
    function formatTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Add a new message to the chat
    function addMessage(content, type = 'user') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        
        let messageHTML = '';
        if (type !== 'system') {
            messageHTML += `<div class="message-sender">${type === 'user' ? 'You' : 'Chatty'}</div>`;
        }
        
        messageHTML += `<div class="message-content">`;
        
        // Handle markdown-like formatting for code blocks and links
        if (typeof content === 'string') {
            // Simple code block handling
            content = content.replace(/```(.+?)```/gs, '<pre><code>$1</code></pre>');
            // Inline code
            content = content.replace(/`(.+?)`/g, '<code>$1</code>');
            // Simple link handling
            content = content.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
            // Line breaks
            content = content.split('\n').map(line => `<p>${line}</p>`).join('');
        } else if (typeof content === 'object') {
            // Handle structured response object from RAG
            if (content.text) {
                content = content.text.split('\n').map(line => `<p>${line}</p>`).join('');
            } else {
                content = '<p>Received a response but couldn\'t parse it properly.</p>';
            }
        }
        
        messageHTML += content;
        messageHTML += `</div>`;
        
        if (type !== 'system') {
            messageHTML += `<div class="message-time">${formatTime()}</div>`;
        }
        
        messageDiv.innerHTML = messageHTML;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'typing-indicator';
        indicatorDiv.id = 'typing-indicator';
        indicatorDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(indicatorDiv);
        scrollToBottom();
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // Send message to server
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Display user message
        addMessage(message, 'user');
        userInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send request to server
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => response.json())
        .then(data => {
            // Hide typing indicator
            hideTypingIndicator();
            
            if (data.error) {
                // Display error message
                addMessage(`Error: ${data.error}`, 'system');
            } else {
                // Display AI response
                let responseContent = data.response;
                addMessage(responseContent, 'ai');
            }
        })
        .catch(error => {
            // Hide typing indicator
            hideTypingIndicator();
            
            // Display error message
            addMessage(`Failed to get a response: ${error}`, 'system');
            console.error('Error:', error);
        });
    }
    
    // Clear chat history
    function clearChat() {
        // Confirm before clearing
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Remove all messages except the first welcome message
            while (chatMessages.children.length > 1) {
                chatMessages.removeChild(chatMessages.lastChild);
            }
            
            // Notify server (optional)
            fetch('/clear_chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            }).catch(error => console.error('Error clearing chat:', error));
        }
    }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Chat is initialized in the page that needs it via initChat()
});

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
    
    // Copy message text to clipboard
    function copyTextToClipboard(text) {
        navigator.clipboard.writeText(text).then(
            function() {
                // Show a temporary success notification
                showNotification('Text copied to clipboard!', 'success');
            },
            function(err) {
                console.error('Could not copy text: ', err);
                showNotification('Failed to copy text to clipboard', 'error');
            }
        );
    }
    
    // Export message to PDF
    function exportToPDF(text, sender) {
        try {
            // Access jsPDF from the global scope
            const { jsPDF } = window.jspdf;
            
            // Create a new PDF document
            const doc = new jsPDF();
            
            // Set title and metadata
            const title = 'Chatty AI Response';
            doc.setProperties({
                title: title,
                author: 'Chatty',
                creator: 'Chatty AI Chat Application'
            });
            
            // Add title
            doc.setFontSize(16);
            doc.text(title, 20, 20);
            
            // Add timestamp
            doc.setFontSize(10);
            const now = new Date();
            doc.text(`Generated on: ${now.toLocaleString()}`, 20, 30);
            
            // Add sender info
            doc.setFontSize(12);
            doc.text(`From: ${sender}`, 20, 40);
            
            // Format and add main content with proper wrapping
            doc.setFontSize(12);
            const textLines = doc.splitTextToSize(text, 170); // Width: 170
            doc.text(textLines, 20, 50);
            
            // Save the PDF
            doc.save('chatty-response.pdf');
            
            // Show success notification
            showNotification('PDF exported successfully!', 'success');
        } catch (error) {
            console.error('Could not export PDF: ', error);
            showNotification('Failed to export PDF', 'error');
        }
    }
    
    // Print message
    function printResponse(text, sender) {
        try {
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            
            // Create content for the print window
            const now = new Date();
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Chatty AI Response</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            border-bottom: 1px solid #ccc;
                            padding-bottom: 10px;
                            margin-bottom: 20px;
                        }
                        .content {
                            white-space: pre-wrap;
                        }
                        .footer {
                            margin-top: 30px;
                            font-size: 0.8em;
                            color: #666;
                            text-align: center;
                        }
                        @media print {
                            .no-print {
                                display: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Chatty AI Response</h1>
                        <p>From: ${sender}</p>
                        <p>Generated on: ${now.toLocaleString()}</p>
                    </div>
                    <div class="content">${text.replace(/\n/g, '<br>')}</div>
                    <div class="footer">Printed from Chatty AI Chat Application</div>
                    <div class="no-print">
                        <button onclick="window.print()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
                            Print this page
                        </button>
                    </div>
                </body>
                </html>
            `;
            
            // Write to the new window and trigger print
            printWindow.document.open();
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            // Show notification
            showNotification('Print window opened', 'success');
        } catch (error) {
            console.error('Could not print: ', error);
            showNotification('Failed to open print window', 'error');
        }
    }
    
    // Show notification 
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}-notification`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove notification after a delay
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 1500);
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
        
        // Store original content for copy feature
        let originalText = '';
        if (typeof content === 'string') {
            originalText = content;
        } else if (typeof content === 'object' && content.text) {
            originalText = content.text;
        }
        
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
            messageHTML += `<div class="message-time">${formatTime()}`;
            
            // Add action buttons for AI responses
            if (type === 'ai') {
                // Print button
                messageHTML += `<button class="action-button print-button" title="Print response" data-content="${encodeURIComponent(originalText)}">
                    <i class="bi bi-printer"></i>
                </button>`;
                
                // PDF export button
                messageHTML += `<button class="action-button pdf-button" title="Export response to PDF" data-content="${encodeURIComponent(originalText)}">
                    <i class="bi bi-file-pdf"></i>
                </button>`;
                
                // Copy button
                messageHTML += `<button class="action-button copy-button" title="Copy response to clipboard" data-content="${encodeURIComponent(originalText)}">
                    <i class="bi bi-clipboard"></i>
                </button>`;
            }
            
            messageHTML += `</div>`;
        }
        
        messageDiv.innerHTML = messageHTML;
        chatMessages.appendChild(messageDiv);
        
        // Add event listeners to buttons
        if (type === 'ai') {
            // Copy button event listener
            const copyButton = messageDiv.querySelector('.copy-button');
            if (copyButton) {
                copyButton.addEventListener('click', function() {
                    const textToCopy = decodeURIComponent(this.getAttribute('data-content'));
                    copyTextToClipboard(textToCopy);
                });
            }
            
            // PDF button event listener
            const pdfButton = messageDiv.querySelector('.pdf-button');
            if (pdfButton) {
                pdfButton.addEventListener('click', function() {
                    const textToExport = decodeURIComponent(this.getAttribute('data-content'));
                    exportToPDF(textToExport, 'Chatty AI');
                });
            }
            
            // Print button event listener
            const printButton = messageDiv.querySelector('.print-button');
            if (printButton) {
                printButton.addEventListener('click', function() {
                    const textToPrint = decodeURIComponent(this.getAttribute('data-content'));
                    printResponse(textToPrint, 'Chatty AI');
                });
            }
        }
        
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

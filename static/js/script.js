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
            
            // Create a temporary div to render markdown to HTML
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            document.body.appendChild(tempDiv);
            
            // Parse markdown to HTML
            tempDiv.innerHTML = marked.parse(text);
            
            // Better text extraction - normalize HTML content to get clean text
            // Remove extra spaces and handle character spacing issues
            let extractedText = '';
            
            // Process each HTML node to extract text properly
            function extractTextFromNode(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    return node.textContent;
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    let text = '';
                    
                    // Add line breaks before specific elements
                    if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BR', 'TR'].includes(node.nodeName)) {
                        text += '\n';
                    }
                    
                    // Add additional line break for block elements to create paragraphs
                    if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(node.nodeName)) {
                        text += '\n';
                    }
                    
                    // Recursively process child nodes
                    for (const childNode of node.childNodes) {
                        text += extractTextFromNode(childNode);
                    }
                    
                    // Add line break after certain elements
                    if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BR', 'TR'].includes(node.nodeName)) {
                        text += '\n';
                    }
                    
                    return text;
                }
                return '';
            }
            
            // Extract text from the HTML
            extractedText = extractTextFromNode(tempDiv);
            
            // Clean up the extracted text
            extractedText = extractedText
                .replace(/\n{3,}/g, '\n\n')  // Replace 3+ consecutive newlines with just 2
                .replace(/\s+/g, ' ')        // Normalize spaces (replace multiple spaces with a single space)
                .replace(/ \n/g, '\n')       // Remove space before newline
                .replace(/\n /g, '\n')       // Remove space after newline
                .trim();
                
            // Split by double line breaks to get paragraphs
            const paragraphs = extractedText.split('\n\n');
            
            // Remove the temp div from the document
            document.body.removeChild(tempDiv);
            
            // Create a new PDF document
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });
            
            // Set title and metadata
            const title = 'Chatty AI Response';
            doc.setProperties({
                title: title,
                author: 'Chatty',
                creator: 'Chatty AI Chat Application',
                subject: 'AI Response',
                keywords: 'Chatty, AI, Response'
            });
            
            // Set font size and line spacing
            const lineHeight = 7; // Increased for better readability
            
            // Set margins with more space
            const margin = 25; 
            const pageWidth = doc.internal.pageSize.width;
            const maxWidth = pageWidth - (2 * margin);
            
            // Add header
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text(title, margin, margin);
            
            // Add metadata
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const now = new Date();
            doc.text(`From: ${sender}`, margin, margin + lineHeight);
            doc.text(`Generated on: ${now.toLocaleString()}`, margin, margin + 2 * lineHeight);
            
            // Add a separator line
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, margin + 3 * lineHeight, pageWidth - margin, margin + 3 * lineHeight);
            
            // Process the content
            let startY = margin + 4 * lineHeight;
            
            // Process paragraphs
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            
            paragraphs.forEach(paragraph => {
                if (paragraph.trim() === '') return; // Skip empty paragraphs
                
                // Check if paragraph appears to be a heading by looking at its length and content
                if (paragraph.length < 50 && 
                    (paragraph.toUpperCase() === paragraph || 
                    paragraph.split(':').length > 1 && paragraph.split(':')[0].length < 25)) {
                    // It's likely a heading or label
                    doc.setFont('helvetica', 'bold');
                    
                    // Use a slightly larger font for headings
                    if (paragraph.length < 20) {
                        doc.setFontSize(12);
                    } else {
                        doc.setFontSize(11);
                    }
                } else {
                    // Regular paragraph
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(11);
                }
                
                // Split the paragraph text to fit the width
                const lines = doc.splitTextToSize(paragraph, maxWidth);
                
                // Check if we need a new page
                if (startY + (lines.length * lineHeight) > doc.internal.pageSize.height - margin) {
                    doc.addPage();
                    startY = margin;
                }
                
                // Add the text
                doc.text(lines, margin, startY);
                
                // Update the Y position
                startY += lines.length * lineHeight + 2; // Add extra space between paragraphs
            });
            
            // Add a footer with page numbers
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text(
                    `Page ${i} of ${totalPages} - Chatty AI Chat Application`,
                    margin,
                    doc.internal.pageSize.height - 10
                );
            }
            
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
                        pre {
                            background-color: #f5f5f5;
                            padding: 10px;
                            border-radius: 4px;
                            overflow-x: auto;
                        }
                        code {
                            background-color: #f5f5f5;
                            padding: 2px 4px;
                            border-radius: 3px;
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
                    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
                </head>
                <body>
                    <div class="header">
                        <h1>Chatty AI Response</h1>
                        <p>From: ${sender}</p>
                        <p>Generated on: ${now.toLocaleString()}</p>
                    </div>
                    <div class="content" id="markdown-content"></div>
                    <div class="footer">Printed from Chatty AI Chat Application</div>
                    <div class="no-print">
                        <button onclick="window.print()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
                            Print this page
                        </button>
                    </div>
                    <script>
                        // Render markdown after page loads
                        document.getElementById('markdown-content').innerHTML = marked.parse(${JSON.stringify(text)});
                    </script>
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
        
        // Handle markdown formatting
        if (typeof content === 'string') {
            // Use marked.js for markdown parsing
            content = marked.parse(content);
        } else if (typeof content === 'object') {
            // Handle structured response object from RAG
            if (content.text) {
                content = marked.parse(content.text);
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

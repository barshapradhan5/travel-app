document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const clearBtn = document.getElementById('clear-chat');
    const suggestionsContainer = document.getElementById('suggestions');
    const toast = document.getElementById('toast');
    
    // Generate a unique session ID for the user
    let sessionId = localStorage.getItem('travel_bot_session');
    if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('travel_bot_session', sessionId);
    }
    
    const API_URL = 'http://localhost:5000/api/chat';

    // Markdown to HTML parser for tables, lists, headers, bold text
    function parseMarkdown(text) {
        if (!text) return '';
        const lines = text.split('\n');
        let html = '';
        let tableBuffer = [];
        let inTable = false;

        function inlineFormat(str) {
            return str
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`([^`]+)`/g, '<code>$1</code>');
        }

        function flushTable() {
            if (tableBuffer.length >= 2) {
                const headerLine = tableBuffer[0];
                const headerCells = headerLine.split('|').map(c => c.trim()).filter((c, i, a) => (i > 0 && i < a.length - 1) || (a.length === 2 && c.length));
                const bodyLines = tableBuffer.slice(2);
                
                let tblHtml = '<div class="table-wrapper"><table class="markdown-table"><thead><tr>';
                headerCells.forEach(cell => {
                    tblHtml += `<th>${inlineFormat(cell)}</th>`;
                });
                tblHtml += '</tr></thead><tbody>';
                bodyLines.forEach(row => {
                    const cells = row.split('|').map(c => c.trim()).filter((c, i, a) => (i > 0 && i < a.length - 1) || (a.length === 2 && c.length));
                    tblHtml += '<tr>';
                    cells.forEach(cell => {
                        tblHtml += `<td>${inlineFormat(cell)}</td>`;
                    });
                    tblHtml += '</tr>';
                });
                tblHtml += '</tbody></table></div>';
                html += tblHtml;
            } else {
                tableBuffer.forEach(l => { html += `<p>${inlineFormat(l)}</p>`; });
            }
            tableBuffer = [];
            inTable = false;
        }

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                inTable = true;
                tableBuffer.push(trimmed);
            } else {
                if (inTable) flushTable();
                if (trimmed.startsWith('### ')) {
                    html += `<h4>${inlineFormat(trimmed.substring(4))}</h4>`;
                } else if (trimmed.startsWith('## ')) {
                    html += `<h3>${inlineFormat(trimmed.substring(3))}</h3>`;
                } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    html += `<li class="md-li">${inlineFormat(trimmed.substring(2))}</li>`;
                } else if (trimmed.length > 0) {
                    html += `<p>${inlineFormat(trimmed)}</p>`;
                } else {
                    html += '<div class="spacer"></div>';
                }
            }
        });
        if (inTable) flushTable();
        return html;
    }

    function appendMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.innerHTML = sender === 'bot' 
            ? '<i class="fa-solid fa-robot"></i>' 
            : '<i class="fa-solid fa-user"></i>';
            
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.innerHTML = sender === 'bot' ? parseMarkdown(text) : text;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
        
        chatBox.appendChild(messageDiv);
        scrollToBottom();
    }
    
    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot');
        typingDiv.id = id;
        
        typingDiv.innerHTML = `
            <div class="avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        chatBox.appendChild(typingDiv);
        scrollToBottom();
        return id;
    }
    
    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
    
    function scrollToBottom() {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
    
    async function sendMessage(message) {
        if (!message.trim()) return;
        
        // Disable input while processing
        userInput.disabled = true;
        sendBtn.disabled = true;
        
        appendMessage('user', message);
        userInput.value = '';
        
        // Hide suggestions after first message
        suggestionsContainer.style.display = 'none';
        
        const typingId = showTypingIndicator();
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    conversation_id: sessionId
                })
            });
            
            removeTypingIndicator(typingId);
            
            if (!response.ok) {
                throw new Error('Server response was not ok');
            }
            
            const data = await response.json();
            appendMessage('bot', data.reply);
            
        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator(typingId);
            showToast('Failed to connect to the server. Is the backend running?');
            appendMessage('bot', 'Sorry, I am having trouble connecting to my servers right now.');
        } finally {
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
        }
    }
    
    // Event Listeners
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage(userInput.value);
    });
    
    clearBtn.addEventListener('click', () => {
        // Clear chat UI except the first message
        while (chatBox.children.length > 1) {
            chatBox.removeChild(chatBox.lastChild);
        }
        // Generate new session ID to clear history
        sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('travel_bot_session', sessionId);
        suggestionsContainer.style.display = 'flex';
    });
    
    // Handle suggestion buttons
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            sendMessage(btn.textContent);
        });
    });
    
    // Initial focus
    userInput.focus();
});

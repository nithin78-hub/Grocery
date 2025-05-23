// Real-time Chat System

class ChatSystem {
    constructor() {
        this.messages = this.loadMessages();
        this.isOpen = false;
        this.websocket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        
        this.initializeChat();
        this.connectWebSocket();
    }
    
    // Initialize chat widget
    initializeChat() {
        this.createChatWidget();
        this.setupEventListeners();
        this.displayMessages();
    }
    
    // Create chat widget HTML if not exists
    createChatWidget() {
        if (document.getElementById('chatWidget')) return;
        
        const chatWidget = document.createElement('div');
        chatWidget.className = 'chat-widget';
        chatWidget.id = 'chatWidget';
        
        chatWidget.innerHTML = `
            <div class="chat-header" onclick="chatSystem.toggleChat()">
                <i class="fas fa-comments"></i>
                <span>Chat Support</span>
                <i class="fas fa-chevron-down" id="chatToggle"></i>
                <div class="chat-status" id="chatStatus">
                    <i class="fas fa-circle"></i>
                </div>
            </div>
            <div class="chat-body" id="chatBody">
                <div class="chat-messages" id="chatMessages">
                    <div class="message bot-message">
                        <div class="message-content">
                            <p>Hello! How can I help you today?</p>
                        </div>
                        <span class="message-time">Now</span>
                    </div>
                </div>
                <div class="chat-typing" id="chatTyping" style="display: none;">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    Support is typing...
                </div>
                <div class="chat-input">
                    <input type="text" id="chatMessageInput" placeholder="Type your message..." 
                           onkeypress="chatSystem.handleKeyPress(event)">
                    <button onclick="chatSystem.sendMessage()" id="sendBtn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(chatWidget);
    }
    
    // Setup event listeners
    setupEventListeners() {
        const messageInput = document.getElementById('chatMessageInput');
        if (messageInput) {
            messageInput.addEventListener('input', () => {
                this.handleTyping();
            });
        }
    }
    
    // Connect to WebSocket server
    connectWebSocket() {
        // In a real application, you would connect to your Java WebSocket server
        // For demo purposes, we'll simulate WebSocket functionality
        this.simulateWebSocket();
    }
    
    // Simulate WebSocket for demo
    simulateWebSocket() {
        this.updateConnectionStatus('connected');
        
        // Simulate admin responses
        this.autoResponder = true;
    }
    
    // Toggle chat widget
    toggleChat() {
        const chatBody = document.getElementById('chatBody');
        const chatToggle = document.getElementById('chatToggle');
        
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            chatBody.classList.add('open');
            chatToggle.className = 'fas fa-chevron-up';
            this.scrollToBottom();
        } else {
            chatBody.classList.remove('open');
            chatToggle.className = 'fas fa-chevron-down';
        }
    }
    
    // Handle key press in message input
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.sendMessage();
        }
    }
    
    // Send message
    sendMessage() {
        const messageInput = document.getElementById('chatMessageInput');
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        messageInput.value = '';
        
        // Send to server (simulated)
        this.sendToServer(message);
        
        // Auto-response for demo
        if (this.autoResponder) {
            this.simulateAdminResponse(message);
        }
    }
    
    // Add message to chat
    addMessage(content, sender, timestamp = null) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        
        const time = timestamp ? new Date(timestamp) : new Date();
        const timeString = time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageElement.className = `message ${sender}-message`;
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${this.formatMessage(content)}</p>
            </div>
            <span class="message-time">${timeString}</span>
        `;
        
        messagesContainer.appendChild(messageElement);
        
        // Store message
        this.messages.push({
            content: content,
            sender: sender,
            timestamp: time.toISOString()
        });
        
        this.saveMessages();
        this.scrollToBottom();
        
        // Show notification if chat is closed
        if (!this.isOpen && sender === 'bot') {
            this.showNotification();
        }
    }
    
    // Format message content
    formatMessage(content) {
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        content = content.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
        
        // Convert line breaks
        content = content.replace(/\n/g, '<br>');
        
        return content;
    }
    
    // Simulate admin response
    simulateAdminResponse(userMessage) {
        setTimeout(() => {
            this.showTyping();
            
            setTimeout(() => {
                this.hideTyping();
                const response = this.generateAutoResponse(userMessage);
                this.addMessage(response, 'bot');
            }, 1000 + Math.random() * 2000);
        }, 500);
    }
    
    // Generate automatic response based on user message
    generateAutoResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        const responses = {
            greetings: [
                "Hello! How can I assist you today?",
                "Hi there! What can I help you with?",
                "Welcome! How may I help you?"
            ],
            order: [
                "I can help you with your order. Could you please provide your order number?",
                "For order-related queries, please share your order details and I'll assist you.",
                "I'm here to help with your order. What specific information do you need?"
            ],
            shipping: [
                "We offer free shipping on orders over $50. Standard delivery takes 2-3 business days.",
                "Shipping usually takes 2-3 business days. You'll receive a tracking number once your order ships.",
                "Our shipping is fast and reliable! Orders are typically delivered within 2-3 business days."
            ],
            payment: [
                "We accept all major credit cards, PayPal, and bank transfers. Your payment information is secure.",
                "Payment is processed securely. We accept Visa, MasterCard, American Express, and PayPal.",
                "Your payment is safe with us. We use industry-standard encryption to protect your information."
            ],
            returns: [
                "We have a 30-day return policy. Items must be in original condition for a full refund.",
                "Returns are easy! You have 30 days to return items in their original packaging.",
                "Our return policy allows 30 days for returns. Contact us to initiate a return."
            ],
            products: [
                "We have a wide selection of fresh groceries. Is there a specific product you're looking for?",
                "Our product catalog includes fresh fruits, vegetables, dairy, and more. What are you interested in?",
                "Looking for something specific? I can help you find the right products."
            ],
            default: [
                "Thank you for your message. Let me connect you with a specialist who can better assist you.",
                "I understand your concern. A member of our support team will get back to you shortly.",
                "That's a great question! Our team will provide you with detailed information soon."
            ]
        };
        
        // Check for keywords and return appropriate response
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return this.getRandomResponse(responses.greetings);
        } else if (message.includes('order') || message.includes('purchase')) {
            return this.getRandomResponse(responses.order);
        } else if (message.includes('shipping') || message.includes('delivery')) {
            return this.getRandomResponse(responses.shipping);
        } else if (message.includes('payment') || message.includes('pay') || message.includes('credit')) {
            return this.getRandomResponse(responses.payment);
        } else if (message.includes('return') || message.includes('refund')) {
            return this.getRandomResponse(responses.returns);
        } else if (message.includes('product') || message.includes('item')) {
            return this.getRandomResponse(responses.products);
        } else {
            return this.getRandomResponse(responses.default);
        }
    }
    
    // Get random response from array
    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Show typing indicator
    showTyping() {
        const typingElement = document.getElementById('chatTyping');
        if (typingElement) {
            typingElement.style.display = 'block';
            this.scrollToBottom();
        }
    }
    
    // Hide typing indicator
    hideTyping() {
        const typingElement = document.getElementById('chatTyping');
        if (typingElement) {
            typingElement.style.display = 'none';
        }
    }
    
    // Handle user typing
    handleTyping() {
        // In real application, send typing indicator to server
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            // Stop typing indicator
        }, 1000);
    }
    
    // Scroll chat to bottom
    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    // Show notification
    showNotification() {
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            chatHeader.classList.add('has-notification');
            
            setTimeout(() => {
                chatHeader.classList.remove('has-notification');
            }, 3000);
        }
    }
    
    // Update connection status
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('chatStatus');
        if (statusElement) {
            statusElement.className = `chat-status ${status}`;
            statusElement.title = status === 'connected' ? 'Online' : 'Offline';
        }
    }
    
    // Send message to server
    sendToServer(message) {
        if (!currentUser) return;
        
        // In real application, send via WebSocket or AJAX to your Java backend
        const messageData = {
            userId: currentUser.id,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        // Simulate server storage
        console.log('Sending to server:', messageData);
    }
    
    // Load messages from localStorage
    loadMessages() {
        const savedMessages = localStorage.getItem('chatMessages');
        return savedMessages ? JSON.parse(savedMessages) : [];
    }
    
    // Save messages to localStorage
    saveMessages() {
        localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    }
    
    // Display existing messages
    displayMessages() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        // Clear existing messages except welcome message
        const welcomeMessage = messagesContainer.querySelector('.message');
        messagesContainer.innerHTML = '';
        if (welcomeMessage) {
            messagesContainer.appendChild(welcomeMessage);
        }
        
        // Display saved messages
        this.messages.forEach(msg => {
            if (msg.sender !== 'system') {
                this.addMessage(msg.content, msg.sender, msg.timestamp);
            }
        });
    }
    
    // Clear chat history
    clearHistory() {
        if (confirm('Are you sure you want to clear chat history?')) {
            this.messages = [];
            this.saveMessages();
            
            const messagesContainer = document.getElementById('chatMessages');
            messagesContainer.innerHTML = `
                <div class="message bot-message">
                    <div class="message-content">
                        <p>Hello! How can I help you today?</p>
                    </div>
                    <span class="message-time">Now</span>
                </div>
            `;
        }
    }
}

// Initialize chat system
let chatSystem;

// Global functions for backward compatibility
function toggleChat() {
    if (chatSystem) {
        chatSystem.toggleChat();
    }
}

function sendMessage() {
    if (chatSystem) {
        chatSystem.sendMessage();
    }
}

function openChat() {
    if (chatSystem && !chatSystem.isOpen) {
        chatSystem.toggleChat();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize chat system after a short delay to ensure other scripts are loaded
    setTimeout(() => {
        chatSystem = new ChatSystem();
    }, 500);
});

// Add chat widget styles
const chatStyles = `
<style>
.chat-widget .chat-status {
    position: absolute;
    top: 10px;
    right: 40px;
    width: 8px;
    height: 8px;
}

.chat-status i {
    font-size: 8px;
}

.chat-status.connected i {
    color: #27ae60;
}

.chat-status.disconnected i {
    color: #e74c3c;
}

.chat-header.has-notification {
    animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.chat-typing {
    padding: 0.5rem 1rem;
    background: #f1f2f6;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #666;
}

.typing-indicator {
    display: flex;
    gap: 2px;
}

.typing-indicator span {
    width: 4px;
    height: 4px;
    background: #999;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}

.message-content a {
    color: #3498db;
    text-decoration: underline;
}

.message-content a:hover {
    color: #2980b9;
}
</style>
`;

// Add styles to document head
document.head.insertAdjacentHTML('beforeend', chatStyles);
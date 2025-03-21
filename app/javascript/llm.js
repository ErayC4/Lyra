document.addEventListener('DOMContentLoaded', function() {
    const aiField = document.querySelector('.ai-field');
    const aiInput = document.querySelector('.ai-inputfield');
    const sendButton = document.querySelector('.small-black-button');
    const API_URL = 'http://localhost:11434/api/chat';
  
    let chatHistory = [];
    let currentChatId = null; // Track the current chat ID
  
    // Function to format AI responses with markdown-like syntax
    function formatAIResponse(text) {
        // Remove thinking sections
        text = text.replace(/<think>[\s\S]*?<\/think>/g, '');
        
        // Format bold text (** or __)
        text = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>');
        
        // Format headers (###)
        text = text.replace(/### (.*?)($|\n)/g, '<h3>$1</h3>');
        
        // Format lists (- or *)
        text = text.replace(/^(- |\* )(.*?)$/gm, '<li>$2</li>');
        text = text.replace(/(<li>.*?<\/li>\n?)+/g, '<ul>$&</ul>');
        
        // Format code blocks (```)
        text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Format inline code (`)
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Format paragraphs
        text = text.replace(/\n\n/g, '</p><p>');
        
        // Format line breaks
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
  
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'ai-message';
        if (isUser) {
            messageDiv.textContent = text;
        } else {
            messageDiv.innerHTML = formatAIResponse(text);
        }
        aiField.appendChild(messageDiv);
    }
  
    // Function to locally reset the chat without server interaction
    function resetChatInterface() {
        currentChatId = null;
        chatHistory = [];
        aiField.innerHTML = '';
        
        // Add welcome message
        addMessage('Hallo! Wie kann ich dir helfen?', false);
    }
    
    // Function to update the chat on the server
    function updateChatOnServer() {
        fetch(`/ais/${currentChatId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
            },
            body: JSON.stringify({
                ai: { chat: chatHistory }
            })
        })
        .then(response => {
            return response.json();
        })
    }
  
    // Function to create a new chat on the server and return the ID
    async function createNewChatOnServer() {
        const response = await fetch("/ais", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
            },
            body: JSON.stringify({
                ai: { chat: [{ role: "system", content: "" }] }
            })
        });
        const data = await response.json();
        if (data.errors) {
            console.error("Fehler:", data.errors);
            return null;
        } else if (data.id) {
            return data.id;
        }
        return null;
    }
    
    // Function to send a message to DeepSeek
    async function sendToDeepSeek(userInput) {
        // Add user message to chat history
        chatHistory.push({ role: "user", content: userInput });
    
        // Show loading indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'ai-message typing';
        typingIndicator.textContent = 'DeepSeek denkt...';
        aiField.appendChild(typingIndicator);
        
        try {
            // Check if we have a current chat - if not, create one
            if (!currentChatId) {
                const newChatId = await createNewChatOnServer();
                
                if (!newChatId) {
                    throw new Error("Chat konnte nicht erstellt werden");
                }
                
                currentChatId = newChatId;
            }
            
            // Now we can send the request to DeepSeek
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "deepseek-r1:8b",
                    messages: chatHistory,
                    stream: false
                })
            });
    
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
            const data = await response.json();
            aiField.removeChild(typingIndicator);
    
            const aiResponse = data.message.content;
            addMessage(aiResponse, false);
            chatHistory.push({ role: "assistant", content: aiResponse });
    
            // Update the chat on the server
            updateChatOnServer();
    
        } catch (error) {
            console.error('Fehler:', error);
            if (typingIndicator.parentNode) {
                aiField.removeChild(typingIndicator);
            }
            addMessage('Fehler: ' + error.message, false);
        }
    }
  
    // Function to send a message from the input field
    function sendMessage() {
        const userInput = aiInput.value.trim();
        if (userInput) {
            addMessage(userInput, true);
            sendToDeepSeek(userInput);
            aiInput.value = '';
        }
    }
        
    // Load and open a chat with a specific ID
    window.openChat = function(chatId) {
        // Update the current chat ID
        currentChatId = chatId;
        
        // Clear the current chat history and messages in the UI
        chatHistory = [];
        aiField.innerHTML = '';
                
        // Fetch the selected chat data from the server
        fetch(`/ais/${chatId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json", // Explicitly request JSON
                "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
            }
        })
        .then(response => {
            // Check the Content-Type of the response
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json();
            } else {
                // If not a JSON response, show an error message
                throw new Error("Serverantwort ist kein JSON. Erhalten: " + contentType);
            }
        })
        .then(data => {
            if (data.errors) {
                alert("Fehler beim Laden des Chats: " + data.errors.join(", "));
                return;
            }
            
            // Load the chat history
            if (data.chat && Array.isArray(data.chat)) {
                chatHistory = data.chat;
                
                // Display messages in the UI
                chatHistory.forEach(msg => {
                    if (msg.role === "user" || msg.role === "assistant") {
                        addMessage(msg.content, msg.role === "user");
                    }
                });
            }
            
            // If chat is empty, add a welcome message
            if (aiField.children.length === 0) {
                addMessage('Chat geladen. Wie kann ich dir helfen?', false);
            }
        })
        
    };
    
    // Buttons in dropdown to load specific chats
    document.querySelectorAll('.note-item button').forEach(button => {
        button.addEventListener('click', function() {
            const chatId = this.getAttribute('data-chat-id');
            if (chatId) {
                openChat(chatId);
            }
        });
    });
  
    // Set up event listener for the "New Chat" button
    const createAiButton = document.getElementById("create-ai-button");
    if (createAiButton) {
        createAiButton.addEventListener("click", resetChatInterface);
    }
  
    document.addEventListener('click', function(event) {
        if (event.target.closest('a[data-turbo-method="delete"]')) {
            resetChatInterface();
        }
    });

    // Set up event listener for the "Send" button
    sendButton.addEventListener('click', function() {
        sendMessage();
    });
  
    // Set up event listener for the Enter key in the text field
    aiInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
  
    // Initialize with a welcome message if no specific chat is loaded
    if (!currentChatId) {
        addMessage('Hallo! Wie kann ich dir helfen?', false);
    }
});
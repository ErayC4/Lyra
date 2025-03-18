document.addEventListener('DOMContentLoaded', function() {
    const aiField = document.querySelector('.ai-field');
    const aiInput = document.querySelector('.ai-inputfield');
    const sendButton = document.querySelector('.small-black-button');
    const API_URL = 'http://localhost:11434/api/chat';
  
    let chatHistory = [];
    let currentChatId = null; // Track the current chat ID
  
    
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'ai-message';
        messageDiv.style.padding = '8px 12px';
        messageDiv.style.marginBottom = '8px';
        messageDiv.style.borderRadius = '4px';
  
        if (isUser) {
            messageDiv.style.backgroundColor = '#F5D5FF';
            messageDiv.style.marginLeft = 'auto';
        } else {
            messageDiv.style.backgroundColor = 'transparent';
            text = text.replace(/<think>[\s\S]*?<\/think>/g, '');
        }
  
        messageDiv.textContent = text;
        aiField.appendChild(messageDiv);
        aiField.scrollTop = aiField.scrollHeight;
    }
  
    // Funktion zum lokalen Zurücksetzen des Chats ohne Server-Interaktion
    function resetChatInterface() {
        currentChatId = null;
        chatHistory = [];
        aiField.innerHTML = '';
        
        // Add welcome message
        addMessage('Hallo! Wie kann ich dir helfen?', false);
    }
    
    // Funktion zur Aktualisierung des Chats auf dem Server
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
  
    // Funktion, die einen neuen Chat auf dem Server erstellt und die ID zurückgibt
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
    
    // Funktion zum Senden einer Nachricht an DeepSeek
    async function sendToDeepSeek(userInput) {
        // Füge die Benutzernachricht zur Chatgeschichte hinzu
        chatHistory.push({ role: "user", content: userInput });
    
        // Lade-Indikator anzeigen
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'ai-message typing';
        typingIndicator.textContent = 'DeepSeek denkt...';
        aiField.appendChild(typingIndicator);
        
        try {
            // Prüfen, ob wir einen aktuellen Chat haben - wenn nicht, erstelle einen (bei default currentChatId = null)
            if (!currentChatId) {
                const newChatId = await createNewChatOnServer();
                
                if (!newChatId) {
                    throw new Error("Chat konnte nicht erstellt werden");
                }
                
                currentChatId = newChatId;
            }
            
            // Jetzt können wir die Anfrage an DeepSeek senden
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
    
            // aktualisiert den Chat auf dem Server
            updateChatOnServer();
    
        } catch (error) {
            console.error('Fehler:', error);
            if (typingIndicator.parentNode) {
                aiField.removeChild(typingIndicator);
            }
            addMessage('Fehler: ' + error.message, false);
        }
    }
  
    // Funktion zum Senden einer Nachricht aus dem Eingabefeld
    function sendMessage() {
        const userInput = aiInput.value.trim();
        if (userInput) {
            addMessage(userInput, true);
            sendToDeepSeek(userInput);
            aiInput.value = '';
        }
    }
        
    // lädt und öffnet einen Chat mit einer bestimmten ID.
    window.openChat = function(chatId) {
        currentChatId = chatId;
        chatHistory = [];
        aiField.innerHTML = '';
        
        // Fetch the chat data from the server
        fetch(`/ais/${chatId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json", 
                "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
            }
        })
        .then(response => {
            return response.json();
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
        })
        .catch(error => {
            console.error("Fehler beim Laden des Chats:", error);
            addMessage('Fehler beim Laden des Chats: ' + error.message, false);
        });
    };
  
    // buttons im dropdown, zum laden von bestimmten chats
    document.querySelectorAll('.note-item button').forEach(button => {
        button.addEventListener('click', function() {
            const chatId = this.getAttribute('data-chat-id');
            if (chatId) {
                window.openChat(chatId);
            }
        });
    });
  
    // Event-Listener für den "Neuen Chat"-Button einrichten
    const createAiButton = document.getElementById("create-ai-button");
    if (createAiButton) {
        createAiButton.addEventListener("click", resetChatInterface);
    }
  
    // Event-Listener für den "Senden"-Button einrichten
    sendButton.addEventListener('click', function() {
        sendMessage();
    });
  
    // Event-Listener für die Eingabetaste im Textfeld einrichten
    aiInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
  
    // Initialisieren mit einer Willkommensnachricht, wenn kein spezifischer Chat geladen ist
    if (!currentChatId) {
        addMessage('Hallo! Wie kann ich dir helfen?', false);
    }
  });
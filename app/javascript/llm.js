document.addEventListener('DOMContentLoaded', function() {
    const aiField = document.querySelector('.ai-field');
    const aiInput = document.querySelector('.ai-inputfield');
    const sendButton = document.querySelector('.small-black-button');
    const API_URL = 'http://localhost:11434/api/chat';
  
    let chatHistory = [];
    let currentChatId = null; // Track the current chat ID
  
    // Debug element to show current chat
    // const debugDiv = document.createElement('div');
    // debugDiv.id = 'chat-debug';
    // debugDiv.style.padding = '5px';
    // debugDiv.style.backgroundColor = '#f0f0f0';
    // debugDiv.style.borderRadius = '4px';
    // debugDiv.style.marginBottom = '10px';
    // debugDiv.style.fontSize = '12px';
    // debugDiv.textContent = 'Aktueller Chat: Neu (nicht gespeichert)';
    // document.querySelector('.ai-field').parentNode.insertBefore(debugDiv, document.querySelector('.ai-field'));
  
    // Machen Sie die openChat-Funktion global verfügbar
    window.openChat = function(chatId) {
        // Update the current chat ID
        currentChatId = chatId;
        
        // Clear the current chat history and messages in the UI
        chatHistory = [];
        aiField.innerHTML = '';
        
        // Update debug information
        // updateDebugInfo();
        
        // Fetch the selected chat data from the server
        fetch(`/ais/${chatId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json", // Explizit JSON anfordern
                "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
            }
        })
        .then(response => {
            // Überprüfen Sie den Content-Type der Antwort
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json();
            } else {
                // Wenn keine JSON-Antwort, zeigen Sie eine Fehlermeldung
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
        .catch(error => {
            console.error("Fehler beim Laden des Chats:", error);
            addMessage('Fehler beim Laden des Chats: ' + error.message, false);
        });
    };
  
    // function updateDebugInfo() {
    //     if (currentChatId) {
    //         debugDiv.textContent = `Aktueller Chat: ID ${currentChatId}`;
    //     } else {
    //         debugDiv.textContent = 'Aktueller Chat: Neu (nicht gespeichert)';
    //     }
    // }
  
    // Funktion zum lokalen Zurücksetzen des Chats ohne Server-Interaktion
    function resetChatInterface() {
        currentChatId = null;
        chatHistory = [];
        aiField.innerHTML = '';
        updateDebugInfo();
        
        // Add welcome message
        addMessage('Hallo! Wie kann ich dir helfen?', false);
    }
    
    // Neue Funktion, die einen neuen Chat auf dem Server erstellt und die ID zurückgibt
    function createNewChatOnServer() {
        return fetch("/ais", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
            },
            body: JSON.stringify({
                ai: { chat: [{ role: "system", content: "" }] }
            })
        })
        .then(response => {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json();
            } else {
                throw new Error("Serverantwort ist kein JSON. Erhalten: " + contentType);
            }
        })
        .then(data => {
            if (data.errors) {
                console.error("Fehler:", data.errors);
                return null;
            } else if (data.id) {
                return data.id;
            }
            return null;
        });
    }
    
    // Funktion, die die UI zurücksetzt und einen neuen Chat erstellt
    function createNewChat() {
        resetChatInterface();
        
        createNewChatOnServer()
            .then(chatId => {
                if (chatId) {
                    currentChatId = chatId;
                    updateDebugInfo();
                } else {
                    console.error("Konnte keinen neuen Chat erstellen");
                }
            })
            .catch(error => {
                console.error("Fehler beim Erstellen des Chats:", error);
            });
    }
    
    // Machen Sie die newChat-Funktion global verfügbar
    window.newChat = createNewChat;
  
    // Set up event listener for chat buttons
    document.querySelectorAll('.note-item button').forEach(button => {
        button.addEventListener('click', function() {
            const chatId = this.getAttribute('data-chat-id');
            if (chatId) {
                window.openChat(chatId);
            }
        });
    });
  
    // Set up event listener for new chat button
    const createAiButton = document.getElementById("create-ai-button");
    if (createAiButton) {
        createAiButton.addEventListener("click", createNewChat);
    }
  
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'ai-message';
        messageDiv.style.padding = '8px 12px';
        messageDiv.style.marginBottom = '8px';
        messageDiv.style.borderRadius = '4px';
        messageDiv.style.maxWidth = '80%';
  
        if (isUser) {
            messageDiv.style.backgroundColor = '#e9f5ff';
            messageDiv.style.marginLeft = 'auto';
        } else {
            messageDiv.style.backgroundColor = '#f5f5f5';
            text = text.replace(/<think>[\s\S]*?<\/think>/g, '');
        }
  
        messageDiv.textContent = text;
        aiField.appendChild(messageDiv);
        aiField.scrollTop = aiField.scrollHeight;
    }
  
    async function sendToDeepSeek(userInput) {
        // Füge die Benutzernachricht zur Chatgeschichte hinzu
        chatHistory.push({ role: "user", content: userInput });
  
        // Lade-Indikator anzeigen
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'ai-message typing';
        typingIndicator.textContent = 'DeepSeek denkt...';
        aiField.appendChild(typingIndicator);
        
        try {
            // Prüfen, ob wir einen aktuellen Chat haben - wenn nicht, erstelle einen
            if (!currentChatId) {
                const newChatId = await createNewChatOnServer();
                
                if (!newChatId) {
                    throw new Error("Chat konnte nicht erstellt werden");
                }
                
                currentChatId = newChatId;
                updateDebugInfo();
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
  
    function updateChatOnServer() {
        if (!currentChatId) {
            console.warn("Kein aktueller Chat zum Speichern vorhanden");
            return;
        }
        
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
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json();
            } else {
                console.warn("Serverantwort beim Speichern ist kein JSON: " + contentType);
                return { success: true };
            }
        })
        .then(data => {
            if (data.errors) {
                console.error("Fehler beim Speichern des Chats:", data.errors);
            }
        })
        .catch(error => console.error("Fehler beim Speichern des Chats:", error));
    }
  
    sendButton.addEventListener('click', function() {
        sendMessage();
    });
  
    aiInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
  
    function sendMessage() {
        const userInput = aiInput.value.trim();
        if (userInput) {
            addMessage(userInput, true);
            sendToDeepSeek(userInput);
            aiInput.value = '';
        }
    }
  
    // Initialize with a welcome message if no specific chat is loaded
    if (!currentChatId) {
        addMessage('Hallo! Wie kann ich dir helfen?', false);
    }
  });
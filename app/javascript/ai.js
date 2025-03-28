document.addEventListener('DOMContentLoaded', function() {
    const aiField = document.querySelector('.ai-field');
    const aiInput = document.querySelector('.ai-inputfield');
    const sendButton = document.querySelector('.small-black-button');
    const API_URL = 'http://localhost:11434/api/chat';
  
    let chatHistory = [];
    let currentChatId = null; // Track the current chat ID


    const debugInfo = document.createElement('div');
    debugInfo.style.position = 'fixed';
    debugInfo.style.bottom = '10px';
    debugInfo.style.right = '10px';
    debugInfo.style.background = 'rgba(0,0,0,0.7)';
    debugInfo.style.color = 'white';
    debugInfo.style.padding = '5px 10px';
    debugInfo.style.borderRadius = '5px';
    debugInfo.style.fontSize = '12px';
    debugInfo.textContent = 'Chat ID: null';
    document.body.appendChild(debugInfo);
    

    function updateDebugInfo() {
        debugInfo.textContent = `Chat ID: ${currentChatId}`;
    }
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
        updateDebugInfo();
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
                ai: { chat: [] }
            })
        });
        const data = await response.json();
        if (data.errors) {
            console.error("Fehler:", data.errors);
            return null;
        } else if (data.id) {
            updateDebugInfo();
            return data.id;
        }
        return null;
    }
    
    // Function to send a message to DeepSeek
    // Function to send a message to DeepSeek
    async function sendToDeepSeek(userInput) {
        // Temporäre Kopie des Chat-Verlaufs erstellen
        const tempChatHistory = [...chatHistory, { role: "user", content: userInput }];
        
        // Show loading indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'ai-message typing';
        typingIndicator.textContent = 'AI denkt...';
        aiField.appendChild(typingIndicator);
        
        let newChatId = null;
        let shouldSaveChat = false; // Flag to determine if we should save the chat
        
        try {
            // Check if we have a current chat - if not, create one
            if (!currentChatId) {
                newChatId = await createNewChatOnServer();
                
                if (!newChatId) {
                    throw new Error("Chat konnte nicht erstellt werden");
                }
                
                currentChatId = newChatId;
                updateDebugInfo();
            }
            
            // Now we can send the request to DeepSeek
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "deepseek-r1:8b",
                    messages: tempChatHistory,
                    stream: false
                })
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            aiField.removeChild(typingIndicator);

            const aiResponse = data.message.content;
            addMessage(aiResponse, false);
            
            // Nur wenn wir hier angekommen sind, war die Antwort erfolgreich
            shouldSaveChat = true;
            
            // Aktualisiere den Chat-Verlauf
            chatHistory = [...tempChatHistory, { role: "assistant", content: aiResponse }];
            
            // Erstelle Chat-Listeneintrag nur bei erfolgreicher Antwort
            createChatListItem(userInput);

        } catch (error) {
            console.error('Fehler:', error);
            if (typingIndicator.parentNode) {
                aiField.removeChild(typingIndicator);
            }
            
            // Wenn es einen neuen Chat gab, aber die Antwort fehlgeschlagen ist, löschen wir ihn
            if (newChatId && !shouldSaveChat) {
                await deleteFailedChat(newChatId);
                if (currentChatId === newChatId) {
                    currentChatId = null;
                    updateDebugInfo();
                }
            }
        } finally {
            // Nur wenn die Antwort erfolgreich war, speichern wir den Chat
            if (shouldSaveChat && currentChatId) {
                updateChatOnServer();
            }
        }
    }

    // Neue Funktion zum Löschen fehlgeschlagener Chats
    async function deleteFailedChat(chatId) {
        try {
            await fetch(`/ais/${chatId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
                }
            });
        } catch (error) {
            console.error('Fehler beim Löschen des fehlgeschlagenen Chats:', error);
        }
    }
    
    // Function to send a message from the input field
    function sendMessage() {
        const userInput = aiInput.value.trim();
        if (userInput) {
            // Nachricht wie gewohnt senden
            addMessage(userInput, true);
            sendToDeepSeek(userInput);
            
            // Chat-Button mit der Nachrichtenvorschau erstellen
            
            // Eingabefeld leeren
            aiInput.value = '';
        }
    }
    
    // !!!!! actually part of dropdownmenu, its here because idk 
    function createChatListItem(userMessage) {
        // Check if a chat list item already exists
        const chatListContainer = document.querySelector('.just-added-content');
        const existingChatItems = chatListContainer.querySelectorAll('.chat-list-item');
        
        // Only create a new item if no items exist
        if (existingChatItems.length > 0) {
            return; // Exit the function if an item already exists
        }
        
        const chatId = currentChatId 
        
        // Die ersten 5 Wörter der Nachricht extrahieren
        const previewText = userMessage.split(' ').slice(0, 5).join(' ');
        
        // HTML für den Button erstellen
        const buttonHTML = `
            <button 
                onclick="openChat(${chatId})" 
                data-chat-id="${chatId}"
                class="chat-list-item"
                >
                <div class="chat-list-item-container">
                    <p class="chat-title">${previewText}</p>
                    <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    class="lucide lucide-bookmark"
                    ><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>                       
                </div>
            </button>
        `;
        
        // Element erstellen und zum Container hinzufügen
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = buttonHTML.trim();
        const buttonElement = tempDiv.firstChild;
        
        // Am Anfang der Liste einfügen oder ans Ende anhängen
        if (chatListContainer.firstChild) {
            chatListContainer.insertBefore(buttonElement, chatListContainer.firstChild);
        } else {
            chatListContainer.appendChild(buttonElement);
        }
    
        // Add event listener for bookmark toggle
        const bookmarkIcon = buttonElement.querySelector('.lucide-bookmark');
        bookmarkIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent openChat from being called
            toggleBookmark(event, chatId);
        });
    }
    
    // !!!!! actually part of dropdownmenu, its here because idk    
    // Load and open a chat with a specific ID
    openChat = function(chatId) {
        // Update the current chat ID
        document.querySelectorAll('.chat-list-item').forEach(item => {
            item.classList.remove('chat-list-item-active');
        });
    
        // Add 'chat-list-item-active' to the clicked chat list item
        const currentChatButton = document.querySelector(`.chat-list-item[data-chat-id="${chatId}"]`);
        if (currentChatButton) {
            currentChatButton.classList.add('chat-list-item-active');
        }

        //updates current chat
        currentChatId = chatId;
        updateDebugInfo();
        // Clear the current chat history and messages in the UI
        chatHistory = [];
        aiField.innerHTML = '';
                
        // Fetch the selected chat data from the server
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
            if (data.chat) {
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
    document.querySelectorAll('.note-item').forEach(button => {
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
    function toggleBookmark(event, chatId) {
        // Prevent the click from bubbling to the parent button 
        // (which would trigger openChat)
        event.stopPropagation();
        
        // Get the bookmark icon that was clicked
        const bookmarkIcon = event.currentTarget;
        
        // Toggle between filled and unfilled bookmark
        const isSaved = bookmarkIcon.classList.contains('saved');
        
        // Update the visual state immediately for better UX
        if (isSaved) {
            bookmarkIcon.classList.remove('saved');
        } else {
            bookmarkIcon.classList.add('saved');
        }
        
        // Send the update to the server
        fetch(`/ais/${chatId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
            },
            body: JSON.stringify({
                ai: { saved: !isSaved }
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Bookmark status updated successfully:', !isSaved);
        })
        .catch(error => {
            console.error('Error updating bookmark status:', error);
            // Revert the visual state if the server update failed
            if (isSaved) {
                bookmarkIcon.classList.add('saved');
            } else {
                bookmarkIcon.classList.remove('saved');
            }
        });
    }
    
    // Function to initialize bookmark icons
    function initializeBookmarkIcons() {
        document.querySelectorAll('.lucide-bookmark').forEach(icon => {
            // Remove any existing listeners to prevent duplicates
            const newIcon = icon.cloneNode(true);
            icon.parentNode.replaceChild(newIcon, icon);
            
            // Get the chat ID from the parent button
            const chatButton = newIcon.closest('button[data-chat-id]');
            if (chatButton) {
                const chatId = chatButton.getAttribute('data-chat-id');
                
                // Add click event listener for the bookmark icon
                newIcon.addEventListener('click', (event) => toggleBookmark(event, chatId));
            }
        });
    }
    
    // Initialize bookmark icons when the page loads
    initializeBookmarkIcons();
    
    // You should also add some CSS for visual feedback
    const style = document.createElement('style');
    style.textContent = `
        .lucide-bookmark {
            cursor: pointer;
            transition: fill 0.2s ease;
        }
        .lucide-bookmark.saved {
            fill: currentColor;
        }
    `;
    document.head.appendChild(style);
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
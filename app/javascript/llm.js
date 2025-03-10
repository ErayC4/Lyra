document.addEventListener('DOMContentLoaded', function() {
    const aiField = document.querySelector('.ai-field');
    const aiInput = document.querySelector('.ai-inputfield');
    const sendButton = document.querySelector('.small-black-button');
    const API_URL = 'http://localhost:11434/api/chat';
  
    let chatHistory = [];
    let chatId = null; // Speichert die ID des bestehenden Chats
  
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
  
    async function saveChatHistory() {
      try {
        let response;
  
        if (chatId) {
          // Falls ein Chat existiert, aktualisiere ihn mit PATCH
          response = await fetch(`/ais/${chatId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({ ai: { chat: chatHistory } })
          });
        } else {
          // Falls kein Chat existiert, erstelle ihn mit POST
          response = await fetch('/ais', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({ ai: { chat: chatHistory } })
          });
  
          const data = await response.json();
          chatId = data.chat_id; // Speichere die ID für zukünftige Updates
        }
  
        if (!response.ok) {
          throw new Error('Fehler beim Speichern des Chatverlaufs.');
        }
  
        console.log('Chatverlauf erfolgreich gespeichert.');
      } catch (error) {
        console.error('Fehler beim Speichern:', error);
      }
    }
  
    async function sendToDeepSeek(userInput) {
      chatHistory.push({ role: "user", content: userInput });
  
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'ai-message typing';
      typingIndicator.textContent = 'DeepSeek denkt...';
      aiField.appendChild(typingIndicator);
  
      try {
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
  
        await saveChatHistory();
  
      } catch (error) {
        console.error('Fehler bei der Kommunikation mit DeepSeek:', error);
        aiField.removeChild(typingIndicator);
        addMessage('Fehler bei der Verbindung mit DeepSeek.', false);
      }
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
  
    addMessage('Hallo! Wie kann ich dir helfen?', false);
  });
  
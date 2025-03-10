document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("create-ai-button").addEventListener("click", function () {
      fetch("/ais", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
        },
        body: JSON.stringify({
          ai: { chat: [{ role: "system", content: "Neue AI gestartet" }] }
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.errors) {
          alert("Fehler: " + data.errors.join(", "));
        } else {
          const messagesContainer = document.getElementById("ai-messages");
          const newMessage = document.createElement("p");
          newMessage.textContent = "Neue AI erstellt: " + JSON.stringify(data.chat);
          messagesContainer.appendChild(newMessage);
        }
      })
      .catch(error => console.error("Fehler:", error));
    });
  });
  
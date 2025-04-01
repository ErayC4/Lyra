document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('button[data-window-name="ai-window"]').forEach(button => {
        button.classList.add("toolbar-button-active");
    });
});


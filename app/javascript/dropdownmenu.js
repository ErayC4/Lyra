document.addEventListener("DOMContentLoaded", function () {
  // MutationObserver für das Hinzufügen neuer Inhalte
  const section = document.querySelector(".section");
  const targetNode = document.querySelector(".just-added-content");

  if (targetNode) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          console.log("Neuer Inhalt wurde hinzugefügt!");

          if (section.style.display === "none") {
            section.style.display = "block";
          }

          mutation.addedNodes.forEach((node) => {
            node.style.opacity = 0;
            setTimeout(() => {
              node.style.transition = "opacity 0.5s";
              node.style.opacity = 1;
            }, 10);
          });
        }
      });
    });
    observer.observe(targetNode, { childList: true, subtree: true });
  }

  // Umschalten zwischen allen AIs und gespeicherten AIs
  const bookmarksToggle = document.getElementById('bookmarksToggle');
  const allAIsSection = document.getElementById('allAIsSection');
  const savedAIsSection = document.getElementById('savedAIsSection');
  let isBookmarksMode = false;

  if (bookmarksToggle) {
    bookmarksToggle.addEventListener('click', function() {
      isBookmarksMode = !isBookmarksMode;
      if (isBookmarksMode) {
        allAIsSection.style.display = 'none';
        savedAIsSection.style.display = 'block';
        bookmarksToggle.classList.add('active');
      } else {
        allAIsSection.style.display = 'block';
        savedAIsSection.style.display = 'none';
        bookmarksToggle.classList.remove('active');
      }
    });
  }

  // Dropdown-Button-Funktionalität
  const dropdownButton = document.querySelector('.dropdown-button');
  const dropdownContent = document.querySelector('.dropdown-content');

  if (dropdownButton && dropdownContent) {
    dropdownButton.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdownContent.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
      if (!dropdownContent.contains(e.target) && e.target !== dropdownButton) {
        dropdownContent.classList.remove('active');
      }
    });

    document.querySelectorAll('.chat-list-item').forEach(item => {
      item.addEventListener('click', function() {
        dropdownContent.classList.remove('active');
      });
    });
  }
});
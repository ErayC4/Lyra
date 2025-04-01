document.addEventListener('DOMContentLoaded', function() {
  // Alle Toolbar-Buttons auswählen
  const toolbarButtons = document.querySelectorAll('.toolbar-button');
  
  // Alle Fenster auswählen
  const aiWindow = document.querySelector('.ai-window');
  const tocWindow = document.querySelector('.table-of-contents-window');
  const filesWindow = document.querySelector('.files-window');
  
  // Alle Fenster in ein Array packen für einfacheren Zugriff
  const allWindows = [aiWindow, tocWindow, filesWindow];
  
  // Initial alle Fenster verstecken, außer dem ersten (ai-window)
  allWindows.forEach((window, index) => {
    if (index === 0) {
      window.style.display = 'block';
    } else {
      window.style.display = 'none';
    }
  });
  
  // Event-Listener für jeden Button hinzufügen
  toolbarButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Das Attribut data-window-name abrufen
      const windowName = this.getAttribute('data-window-name');
      
      // Zuerst alle Fenster verstecken
      allWindows.forEach(window => {
        if (window) {
          window.style.display = 'none';
        }
      });
      
      // Das entsprechende Fenster anzeigen basierend auf dem data-window-name
      if (windowName === 'ai-window') {
        if (aiWindow) aiWindow.style.display = 'block';
      } else if (windowName === 'table-of-contents-window') {
        if (tocWindow) tocWindow.style.display = 'block';
      } else if (windowName === 'files-window') {
        if (filesWindow) filesWindow.style.display = 'block';
      }
      
      // Aktiven Button hervorheben
      toolbarButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
    });
  });
});
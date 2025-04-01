document.addEventListener('DOMContentLoaded', function() {
  // Alle Toolbar-Buttons auswählen
  const toolbarButtons = document.querySelectorAll('.toolbar-button');
  
  // Alle Fenster auswählen
  const windows = document.querySelectorAll('.ai-window, .table-of-contents-window, .files-window');
  
  // Initial alle Fenster verstecken, außer dem ersten
  windows.forEach((window, index) => {
    if (index === 0) {
      window.style.display = 'block';
    } else {
      window.style.display = 'none';
    }
  });
  
  // Event-Listener für jeden Button hinzufügen
  toolbarButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Zuerst alle Fenster verstecken
      windows.forEach(window => {
        window.style.display = 'none';
      });
      
      // Das Attribut data-window-name abrufen
      const windowName = this.getAttribute('data-window-name');
      
      // Das entsprechende Fenster anzeigen
      const targetWindow = document.querySelector('.' + windowName);
      if (targetWindow) {
        targetWindow.style.display = 'block';
      }
      
      // Aktiven Button hervorheben (optional)
      toolbarButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
    });
  });
});
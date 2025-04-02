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
  
  // Den ersten Button (AI-Window) standardmäßig hervorheben
  const defaultActiveButotn = document.querySelector('.toolbar-button[data-window-name="ai-window"]');
  if (defaultActiveButotn) {
    defaultActiveButotn.classList.remove('toolbar-button');
    defaultActiveButotn.classList.add('toolbar-button-active');
  }
  
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
      
      // Aktiven Button hervorheben
      toolbarButtons.forEach(btn => {
        btn.classList.add('toolbar-button');
        btn.classList.remove('toolbar-button-active');
      });
      this.classList.remove('toolbar-button');
      this.classList.add('toolbar-button-active');
    });
  });
});
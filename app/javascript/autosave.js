function setupAutoSave(element, editorInstance) {
  const instanceOfTableId = element.dataset.instanceOfTableId;
  const tableName = element.dataset.tableName;
  const interval = parseInt(element.dataset.autosaveInterval, 10) || 30000;
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  
  let lastSavedContent = element.dataset.savedContent || "{}";
  let isDirty = false;
  let isSaving = false;
  
  // Funktion zum Vergleichen von Inhalten
  const contentChanged = (newContent) => {
    try {
      // Nur grundlegende Vergleiche durchführen, keine tiefen Objektvergleiche
      return JSON.stringify(newContent) !== lastSavedContent;
    } catch (e) {
      return true; // Im Zweifelsfall speichern
    }
  };
  
  // Eigentliche Speicherfunktion
  const saveContent = () => {
    if (isSaving || !isDirty) return;
    
    isSaving = true;
    
    editorInstance.save()
      .then((output) => {
        if (!contentChanged(output)) {
          isSaving = false;
          return; // Nicht speichern, wenn sich nichts geändert hat
        }
        
        fetch(`/${tableName}s/${instanceOfTableId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({
            [tableName]: { content: output }
          })
        })
        .then(response => {
          isSaving = false;
          if (!response.ok) throw new Error('Autosave failed');
          console.log('Autosave erfolgreich');
          lastSavedContent = JSON.stringify(output);
          isDirty = false;
        })
        .catch(error => {
          isSaving = false;
          console.error('Fehler beim Autosave:', error);
        });
      })
      .catch(error => {
        isSaving = false;
        console.error('Editor Save Error:', error);
      });
  };
  
  // Periodisches Prüfen auf Änderungen mit optimiertem Intervall
  const checkTimer = setInterval(() => {
    if (isDirty && !isSaving) {
      saveContent();
    }
  }, interval);
  
  // Benutzeraktionen im Dokument erkennen
  const markAsDirty = () => {
    isDirty = true;
  };
  
  // Event-Listener für Dokument-Interaktionen hinzufügen
  element.addEventListener('input', markAsDirty);
  element.addEventListener('click', markAsDirty);
  
  // Alternative Methode für Editor-Änderungen (wenn editorInstance spezifische Methoden hat)
  if (typeof editorInstance.subscribe === 'function') {
    // Für EditorJS API v2.0+
    editorInstance.subscribe('change', markAsDirty);
  }
  
  // Bei Verlassen der Seite speichern
  window.addEventListener('beforeunload', (event) => {
    if (!isDirty) return;
    
    clearInterval(checkTimer); // Timer stoppen
    
    editorInstance.save().then((output) => {
      if (contentChanged(output)) {
        navigator.sendBeacon(`/${tableName}s/${instanceOfTableId}`, JSON.stringify({
          _method: 'patch',
          [tableName]: { content: output },
          authenticity_token: csrfToken
        }));
      }
    });
  });
  
  // Aufräumfunktion für den Fall, dass die Komponente entfernt wird
  return function cleanup() {
    clearInterval(checkTimer);
    element.removeEventListener('input', markAsDirty);
    element.removeEventListener('click', markAsDirty);
  };
}
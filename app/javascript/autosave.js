function setupAutoSave(editorInstance, divId, tableName, interval = 30000) {
  const noteElement = document.getElementById(divId);
  if (!noteElement) {
    console.error(`Element mit ID "${divId}" nicht gefunden.`);
    return;
  }

  const noteId = noteElement.dataset.noteId;
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  if (!noteId || !csrfToken) {
    console.error("Fehlende Daten für AutoSave (noteId oder csrfToken).");
    return;
  }

  // Autosave im festgelegten Intervall
  setInterval(() => {
    editorInstance.save()
      .then((output) => {
        fetch(`/${tableName}s/${noteId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({
            note: { content: output }
          })
        })
        .then(response => {
          if (!response.ok) throw new Error('Autosave failed');
          console.log('Autosave erfolgreich');
        })
        .catch(error => console.error('Fehler beim Autosave:', error));
      })
      .catch(error => console.error('Editor Save Error:', error));
  }, interval);

  // Speichern beim Verlassen der Seite
  window.addEventListener('beforeunload', () => {
    editorInstance.save().then((output) => {
      navigator.sendBeacon(`/${tableName}s/${noteId}`, JSON.stringify({
        _method: 'patch',
        note: { content: output },
        authenticity_token: csrfToken
      }));
    });
  });
}

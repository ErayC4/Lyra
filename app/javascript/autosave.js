function setupAutoSave(element, editorInstance) {
    const instanceOfTableId = element.dataset.instanceOfTableId;
    const tableName = element.dataset.tableName;
    const interval = parseInt(element.dataset.autosaveInterval, 10) || 30000;
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  
    setInterval(() => {
      editorInstance.save()
        .then((output) => {
          fetch(`/${tableName}s/${instanceOfTableId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({
              [tableName]: { content: output } // Dynamischer Key für das Model
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
  
    window.addEventListener('beforeunload', () => {
      editorInstance.save().then((output) => {
        navigator.sendBeacon(`/${tableName}s/${instanceOfTableId}`, JSON.stringify({
          _method: 'patch',
          [tableName]: { content: output },
          authenticity_token: csrfToken
        }));
      });
    });
  }
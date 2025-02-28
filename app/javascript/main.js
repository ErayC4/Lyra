document.addEventListener("DOMContentLoaded", function () {
    const editorInstance = new YourEditorLibrary("editor-container"); // Initialisiere deinen Editor
    const editorElement = document.getElementById("editor-container");
  
    if (editorElement) {
      const tableName = editorElement.dataset.tableName;
      const instanceOfTableId = editorElement.dataset.instanceOfTableId;
  
      setupAutoSave(editorInstance, "editor-container", tableName, 5000); // Autosave alle 5 Sekunden
    }
  });
  
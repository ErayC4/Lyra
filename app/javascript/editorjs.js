let editor; // Macht die Editor-Instanz global verfügbar

document.addEventListener("DOMContentLoaded", function () {
  const editorElement = document.querySelector(".editorjs");
  const divId = editorElement.id;
  
  // Editor-Initialisierung
  editor = new EditorJS({
    holder: divId,
    tools: {
      header: Header,
      list: List,
      code: CodeTool,
      paragraph: Paragraph
    },
    autofocus: true
  });

  setupAutoSave(editorElement, editor);
});

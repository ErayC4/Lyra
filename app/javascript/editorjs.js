let editor; // Macht die Editor-Instanz global verfügbar

document.addEventListener("DOMContentLoaded", function () {
  const editorElement = document.querySelector(".editorjs");
  const divId = editorElement.id;

  //damit das inputfeld sich mit dem gesavetem content füllt
  const savedContent = JSON.parse(document.getElementById('editorjs').dataset.savedContent);
  
  // Editor-Initialisierung mit vorhandenen Daten
  editor = new EditorJS({
    holder: divId,
    tools: {
      header: Header,
      list: List,
      code: CodeTool,
      paragraph: Paragraph
    },
    data: savedContent, // Übergabe des vorhandenen Inhalts
    autofocus: true
  });
  
  setupAutoSave(editorElement, editor);
});

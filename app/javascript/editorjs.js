let editor; // Macht die Editor-Instanz global verfügbar

document.addEventListener("DOMContentLoaded", function () {
  // Editor-Initialisierung
  editor = new EditorJS({
    holder: "editorjs",
    tools: {
      header: Header,
      list: List,
      code: CodeTool,
      paragraph: Paragraph
    },
    autofocus: true
  });
});

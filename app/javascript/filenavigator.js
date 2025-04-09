window.addEventListener('DOMContentLoaded', () => {
    const backButton = document.querySelector(".back-btn");
    const fileSelector = document.querySelector(".file-selector");
    backButton.style.display = "none";
    backButton.addEventListener('click', function(){
        fileSelector.style.display = "";
        
        // Alle file-viewer ausblenden
        const pdfViewers = document.querySelectorAll(".file-viewer");
        pdfViewers.forEach(viewer => {
            viewer.style.display = "none";
        });
        
        backButton.style.display = "none";
    });

    // Alle PDF-Datei-Karten auswählen
    const pdfFiles = document.querySelectorAll(".uploaded-file-card");
    
    pdfFiles.forEach(file => {
        file.addEventListener('click', function(){
            // Dateiname aus der angeklickten Karte holen
            const filename = this.querySelector('.uploaded-file-name').textContent;
            
            // Den richtigen file-viewer für diese Datei finden
            const pdfViewer = document.querySelector(`.file-viewer[data-filename="${filename}"]`);
            
            if (pdfViewer) {
                fileSelector.style.display = "none";
                
                // Alle file-viewer ausblenden
                const allViewers = document.querySelectorAll(".file-viewer");
                allViewers.forEach(viewer => {
                    viewer.style.display = "none";
                });
                
                // Nur den ausgewählten file-viewer anzeigen
                pdfViewer.style.display = "";
                backButton.style.display = "";
            }
        });
    });
});
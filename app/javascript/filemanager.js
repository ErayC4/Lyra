document.addEventListener('DOMContentLoaded', function() {
    // Elemente auswählen
    const dropZone = document.getElementById('dropZone');
    const plainFileInput = document.getElementById('fileInput');
    const railsFileInput = document.querySelector('input[type="file"][multiple][accept]'); // Der vom Rails-Helper generierte Input
    const fileList = document.getElementById('fileList');
    
    // Datenspeicher für bereits hinzugefügte Dateien
    let selectedFiles = new Map(); // Speichert Dateiname -> File-Objekt
    
    // Event-Listener für beide Datei-Eingabefelder
    plainFileInput.addEventListener('change', handleFileSelect);
    railsFileInput.addEventListener('change', handleFileSelect);
    
    // Event-Listener für Drag & Drop
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    
    // Klick auf die Upload-Area soll den Rails-File-Input öffnen
    dropZone.addEventListener('click', function() {
        railsFileInput.click();
    });
    
    // Drag & Drop Handler
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    }
    
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
        
        const dt = e.dataTransfer;
        const files = dt.files;
        addFiles(files);
    }
    
    // Dateiauswahl-Handler
    function handleFileSelect(e) {
        const files = e.target.files;
        addFiles(files);
    }
    
    // Funktion zum Hinzufügen von Dateien
    function addFiles(files) {
        Array.from(files).forEach(file => {
            if (!selectedFiles.has(file.name)) {
                selectedFiles.set(file.name, file);

                const fileItem = createFileItem(file);
                fileList.appendChild(fileItem);
            }
        });
        
        // Aktualisiere den Rails-File-Input mit allen ausgewählten Dateien
        updateRailsFileInput();
    }
    
    // Funktion zum Erstellen eines Datei-Elements
    function createFileItem(file) {
        // Dateigröße formatieren
        const fileSize = formatFileSize(file.size);
        
        // Dateityp extrahieren
        const fileType = file.name.split('.').pop().toUpperCase();
        
        // Erstelle das DOM-Element
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.filename = file.name;
        
        fileItem.innerHTML = `
            <div class="file-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="file-info">
                <div class="file-title">${file.name}</div>
                <div class="file-meta">
                    <span class="file-size">${fileSize}</span>
                    <span class="file-type">${fileType}</span>
                </div>
            </div>
            <button class="file-remove" data-filename="${file.name}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;
        
        // Event-Listener für den Entfernen-Button
        const removeButton = fileItem.querySelector('.file-remove');
        removeButton.addEventListener('click', function() {
            const filename = this.dataset.filename;
            removeFile(filename);
        });
        
        return fileItem;
    }
    
    // Funktion zum Formatieren der Dateigröße
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Funktion zum Entfernen einer Datei
    function removeFile(filename) {
        selectedFiles.delete(filename);

        const fileElement = fileList.querySelector(`.file-item[data-filename="${filename}"]`);
        if (fileElement) {
            fileElement.remove();
        }
        
        // Aktualisiere den Rails-File-Input nach dem Entfernen
        updateRailsFileInput();
    }
    
    // Funktion zum Aktualisieren des Rails-File-Input mit ausgewählten Dateien
    function updateRailsFileInput() {
        // FileList ist nicht direkt manipulierbar, daher DataTransfer verwenden
        const dataTransfer = new DataTransfer();
        
        // Alle ausgewählten Dateien zum DataTransfer-Objekt hinzufügen
        selectedFiles.forEach((file) => {
            dataTransfer.items.add(file);
        });
        
        // Das files-Attribut des Rails-Inputs mit dem DataTransfer-Objekt aktualisieren
        railsFileInput.files = dataTransfer.files;
        
        // Change-Event auslösen, damit Rails weiß, dass Dateien ausgewählt wurden
        const event = new Event('change', { bubbles: true });
        railsFileInput.dispatchEvent(event);
    }
});
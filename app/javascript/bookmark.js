function initializeBookmarkIcons() {
    document.querySelectorAll('.bookmark-icon').forEach(icon => {
      // Remove any existing listeners to prevent duplicates
      const newIcon = icon.cloneNode(true);
      icon.parentNode.replaceChild(newIcon, icon);
      const tableName = newIcon.getAttribute('data-table-name');
      // Get the note ID directly from the SVG element
      const itemId = newIcon.getAttribute('data-item-id');
      if (itemId) {
        // Remove the inline onclick attribute if it exists
        newIcon.removeAttribute('onclick');
        
        // Add click event listener for the bookmark icon
        newIcon.addEventListener('click', (event) => toggleBookmark(event, itemId, tableName));
      }
    });
  }
  
  // Modified toggleBookmark function to update the filter on bookmark change
  function toggleBookmark(event, itemId, tableName) {
    event.stopPropagation();
    const bookmarkIcon = event.currentTarget;
    
    // Toggle between filled and unfilled bookmark
    const isbookmarked = bookmarkIcon.classList.contains('bookmarked');
    
    // Update the visual state immediately for better UX
    if (isbookmarked) {
      bookmarkIcon.classList.remove('bookmarked');
    } else {
      bookmarkIcon.classList.add('bookmarked');
    }
    
    // Send the update to the server
    fetch(`/${tableName}s/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
      },
      body: JSON.stringify({
        [tableName]: { bookmarked: !isbookmarked }
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Bookmark status updated successfully:', !isbookmarked);
      
    })
    .catch(error => {
      console.error('Error updating bookmark status:', error);
      // Revert the visual state if the server update failed
      if (isbookmarked) {
        bookmarkIcon.classList.add('bookmarked');
      } else {
        bookmarkIcon.classList.remove('bookmarked');
      }
    });
  }
  
  // Initialize when the page loads
  document.addEventListener('DOMContentLoaded', function() {
    initializeBookmarkIcons();
    
    // Add some CSS for visual feedback and maintain grid layout
    const style = document.createElement('style');
    style.textContent = `
      .bookmark-icon {
        cursor: pointer;
        transition: fill 0.2s ease;
      }
      .bookmark-icon.bookmarked {
        display: block;
        fill: currentColor;
      }
      .hidden-note {
        display: none !important;
      }
      .note-item {
        transition: opacity 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  });
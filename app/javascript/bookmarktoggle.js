
function handleNoteClick(event, url) {
    if (!event.target.closest("svg")) {
      window.location.href = url;
    }
}

function onOffButton(className, defaultColor, afterColor) {
const button = document.querySelector(`.${className}`);
const isFiltered = button.style.backgroundColor === afterColor;

// Toggle button appearance
if (isFiltered) {
  button.style.backgroundColor = defaultColor;
  button.style.color = afterColor;
} else {
  button.style.backgroundColor = afterColor;
  button.style.color = defaultColor;
}

// Toggle visibility of notes based on bookmark status
toggleBookmarkFilter(!isFiltered); // Passing the new state (not the previous state)
}

// Function to show/hide notes based on bookmark status
function toggleBookmarkFilter(showOnlyBookmarked) {
const bookmarkItems = document.querySelectorAll('.bookmarkable-item');

bookmarkItems.forEach(bookmarkItem => {
  const bookmarkIcon = bookmarkItem.querySelector('.bookmark-icon');
  const isBookmarked = bookmarkIcon && bookmarkIcon.classList.contains('bookmarked');
  
  if (showOnlyBookmarked) {
    // When filter is active, only show bookmarked notes
    if (isBookmarked) {
      bookmarkItem.classList.remove('hidden-item');
    } else {
      bookmarkItem.classList.add('hidden-item');
    }
  } else {
    // When filter is inactive, show all notes
    bookmarkItem.classList.remove('hidden-item');
  }
});
}

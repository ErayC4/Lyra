document.addEventListener('DOMContentLoaded', function() {
  const dropdownButton = document.querySelector('.dropdown-button');
  const dropdownContent = document.querySelector('.dropdown-content');
  
  // Toggle dropdown on button click
  dropdownButton.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdownContent.classList.toggle('active');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!dropdownContent.contains(e.target) && e.target !== dropdownButton) {
      dropdownContent.classList.remove('active');
    }
  });

  // Close dropdown when clicking on a chat-list-item
  document.querySelectorAll('.chat-list-item').forEach(item => {
    item.addEventListener('click', function() {
      dropdownContent.classList.remove('active');
    });
  });
});

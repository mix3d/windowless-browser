function createMoveOverlay() {
  const moveOverlay = document.createElement('div');
  moveOverlay.className = 'overlay-container';

  // Add a visual hint for the draggable area
  moveOverlay.innerHTML = `⋮⋮⋮ Drag to move window ⋮⋮⋮`;

  const closeButton = document.createElement('div');
  closeButton.className = 'close';
  closeButton.innerHTML = '✕'; // Using a simple X symbol

  // Handle the close action
  closeButton.addEventListener('click', (e) => {
    // Prevent event from bubbling to prevent any drag behavior
    e.stopPropagation();

    // Send a close message to the main process
    window.borderlessBrowser.closeWindow();
  });

  moveOverlay.appendChild(closeButton);

  return moveOverlay;
}

// Initialize movement functionality
function initializeMovement() {
  const moveOverlay = createMoveOverlay();
  document.body.appendChild(moveOverlay);

  let isMovementEnabled = false;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'F11') {
      isMovementEnabled = !isMovementEnabled;

      moveOverlay.style.opacity = isMovementEnabled ? '1' : '0';
      moveOverlay.style.pointerEvents = isMovementEnabled ? 'auto' : 'none';

      e.preventDefault();
    }
  });
}

// Start the initialization when the document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMovement);
} else {
  initializeMovement();
}

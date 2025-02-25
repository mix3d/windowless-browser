const MODIFIER_KEYS = {
  mac: ["metaKey", "ctrlKey"], // Command + Option
  windows: ["ctrlKey", "altKey"], // Ctrl + Alt
};

const MODIFIER_DISPLAY = {
  metaKey: "⌘",
  ctrlKey: "Ctrl",
  altKey: "Alt",
};

function createMoveOverlay() {
  const moveOverlay = document.createElement("div");
  moveOverlay.className = "overlay-container";

  // Initialize overlay in hidden state
  moveOverlay.style.opacity = "0";
  moveOverlay.style.pointerEvents = "none";
  moveOverlay.style["-webkit-app-region"] = "no-drag";
  moveOverlay.style.display = "none";

  // Dynamically show the appropriate key in the hint text based on OS
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modifierKeys = MODIFIER_KEYS[isMac ? "mac" : "windows"]
    .map((key) => MODIFIER_DISPLAY[key])
    .join(" + ");
  moveOverlay.innerHTML = `⋮⋮⋮ Hold ${modifierKeys} to move window ⋮⋮⋮`;

  const closeButton = document.createElement("div");
  closeButton.className = "close";
  closeButton.innerHTML = "✕";

  closeButton.addEventListener("click", (e) => {
    e.stopPropagation();
    window.borderlessBrowser.closeWindow();
  });

  moveOverlay.appendChild(closeButton);
  return moveOverlay;
}

function initializeMovement() {
  const moveOverlay = createMoveOverlay();
  document.body.appendChild(moveOverlay);

  // Track visibility state to prevent redundant operations
  let isOverlayVisible = false;

  // Detect operating system once at initialization
  const isMac = getMacPlatform();

  const modifierKeys = MODIFIER_KEYS[isMac ? "mac" : "windows"];
  function isModifierKeyActive(event, checkForPressed = true) {
    return modifierKeys
      .map((key) => event[key])
      .every((state) => state === checkForPressed);
  }

  function showOverlay() {
    if (isOverlayVisible) return;
    isOverlayVisible = true;

    moveOverlay.style.display = "grid";
    // Use requestAnimationFrame to ensure smooth transition
    requestAnimationFrame(() => {
      moveOverlay.style.opacity = "1";
      moveOverlay.style.pointerEvents = "auto";
      moveOverlay.style["-webkit-app-region"] = "drag";
    });
  }

  function hideOverlay() {
    if (!isOverlayVisible) return;
    isOverlayVisible = false;

    moveOverlay.style.opacity = "0";
    moveOverlay.style.pointerEvents = "none";
    moveOverlay.style["-webkit-app-region"] = "no-drag";

    moveOverlay.addEventListener(
      "transitionend",
      function hideComplete() {
        moveOverlay.style.display = "none";
        moveOverlay.removeEventListener("transitionend", hideComplete);
      },
      { once: true }
    );
  }

  document.addEventListener("keydown", (e) => {
    console.log("Keydown Event:", e);
    if (isModifierKeyActive(e)) {
      showOverlay();
      // Still prevent default only for Alt key to preserve Command functionality
      // if (!isMac) {
      //   e.preventDefault();
      // }
    }
  });

  document.addEventListener("keyup", (e) => {
    // Pass false to check for key release instead of key press
    if (isModifierKeyActive(e, false)) {
      hideOverlay();
    }
  });

  // Handle edge cases where the key release might not be detected
  window.addEventListener("blur", hideOverlay);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hideOverlay();
    }
  });
}

function getMacPlatform() {
  console.log("getMacPlatform");
  // Try the modern API first
  if (navigator.userAgentData) {
    return navigator.userAgentData.platform.toLowerCase().includes("mac");
  }

  // Fall back to userAgent string parsing if the modern API isn't available
  return /Mac|iPhone|iPod|iPad/.test(navigator.userAgent);
}

if (document.readyState === "loading") {
  // If the document is still loading, wait for the DOMContentLoaded event
  document.addEventListener("DOMContentLoaded", initializeMovement);
} else {
  // If the document is already loaded, initialize immediately
  initializeMovement();
}

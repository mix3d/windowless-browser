const { contextBridge, ipcRenderer } = require('electron');

// We can add custom APIs here if needed
contextBridge.exposeInMainWorld('borderlessBrowser', {
  launchUrl: (url) => {
    if (url) {
      // Add URL to history before launching
      const history = JSON.parse(localStorage.getItem('urlHistory') || '[]');
      // Remove the URL if it already exists to avoid duplicates
      const filteredHistory = history.filter((item) => item !== url);
      // Add new URL to the beginning
      filteredHistory.unshift(url);
      // Keep only the last 4 URLs
      const trimmedHistory = filteredHistory.slice(0, 4);
      // Save back to localStorage
      localStorage.setItem('urlHistory', JSON.stringify(trimmedHistory));

      ipcRenderer.send('launch-url', url);
    }
  },
  getUrlHistory: () => {
    return JSON.parse(localStorage.getItem('urlHistory') || '[]');
  },
  closeWindow: () => ipcRenderer.send('close-window'),
});

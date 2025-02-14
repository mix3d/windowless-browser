const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;

// Track our windows but don't need to track frame state anymore
let launcherWindow = null;
let mainWindow = null;

// Base settings for our content window
const windowSettings = {
  width: 1920,
  height: 1080,
  frame: false,
  transparent: true,
  resizable: false,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js'),
  },
  icon: path.join(__dirname, '../build/icons/png/256x256.png'),
};

// Create our URL input window with a clean, minimal interface
function createLauncherWindow() {
  launcherWindow = new BrowserWindow({
    width: 400,
    height: 200 + 30, //title bar on windows is 30px
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: true,
    autoHideMenuBar: true,
    resizable: false,
    icon: path.join(__dirname, '../build/icons/png/256x256.png'),
  });

  // Load our launcher interface
  launcherWindow.loadFile(path.join(__dirname, 'launcher.html'));
  // run the debugger, only in development, but commented out becuase I don't need it RN
  // if (process.env.NODE_ENV === 'development')
  //   launcherWindow.webContents.openDevTools();
}

// Create our content window with movement overlay
async function createContentWindow(url) {
  mainWindow = new BrowserWindow(windowSettings);
  try {
    await mainWindow.loadURL(url);
  } catch (err) {
    console.log(err);
    mainWindow = null;
    createLauncherWindow();
  }

  try {
    // Read our overlay code file
    const cssPath = path.join(__dirname, 'overlay/overlay.css');
    const jsPath = path.join(__dirname, 'overlay/overlay.js');

    const overlayCSS = await fs.readFile(cssPath, 'utf8');
    const overlayJS = await fs.readFile(jsPath, 'utf8');

    await mainWindow.webContents.insertCSS(overlayCSS);
    // Inject it into the page
    await mainWindow.webContents.executeJavaScript(overlayJS);
  } catch (error) {
    console.error('Failed to inject overlay code:', error);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    createLauncherWindow();
  });
}

// Handle URL launch requests from the launcher window
ipcMain.on('launch-url', (event, url) => {
  if (launcherWindow) {
    launcherWindow.close();
  }
  createContentWindow(url || 'about:blank');
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// Create launcher window when Electron is ready
app.whenReady().then(createLauncherWindow);

// Handle application lifecycle events
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createLauncherWindow();
  }
});

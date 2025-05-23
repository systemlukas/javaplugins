import { app, BrowserWindow } from 'electron';
import * as path from 'path';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.ts'), // Assuming you'll have a preload script
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In development, load from the Vite dev server
  // In production, load the index.html file
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173'); // Default Vite port
    mainWindow.webContents.openDevTools(); // Open DevTools for debugging
  } else {
    // When packaging, this path will point to the React build output
    mainWindow.loadFile(path.join(__dirname, '../src/dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

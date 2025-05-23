// Preload script
// You can expose Node.js APIs to the renderer process here safely.
// Example:
//
// import { contextBridge, ipcRenderer } from 'electron';
//
// contextBridge.exposeInMainWorld('electronAPI', {
//   sendMessage: (message: string) => ipcRenderer.send('message', message),
//   onReply: (callback: (event: any, ...args: any[]) => void) => ipcRenderer.on('reply', callback)
// });

console.log('Preload script loaded.');

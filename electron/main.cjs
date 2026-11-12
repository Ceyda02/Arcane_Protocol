const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const appDataDirectory = app.getPath('appData');
const saveDirectory = path.join(appDataDirectory, 'The Arcane Protocol');
const savePath = path.join(saveDirectory, 'save.json');
const gamePage = pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).href;
const MAX_SAVE_BYTES = 2 * 1024 * 1024;
let mainWindow;
let saveQueue = Promise.resolve();

app.setName('RUNBOUND: The Arcane Protocol');
app.setPath('userData', saveDirectory);

function assertTrustedSender(event) {
  if (!mainWindow || event.sender !== mainWindow.webContents || event.senderFrame?.url.split('#')[0] !== gamePage) {
    throw new Error('Rejected save request from an untrusted frame.');
  }
}

function enqueueSave(operation) {
  const result = saveQueue.then(operation, operation);
  saveQueue = result.catch(() => {});
  return result;
}

ipcMain.handle('save:read', async (event) => {
  assertTrustedSender(event);
  try {
    const text = await fs.readFile(savePath, 'utf8');
    if (Buffer.byteLength(text, 'utf8') > MAX_SAVE_BYTES) throw new Error('The save file is too large.');
    return text;
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
});

ipcMain.handle('save:write', (event, text) => {
  assertTrustedSender(event);
  if (typeof text !== 'string' || Buffer.byteLength(text, 'utf8') > MAX_SAVE_BYTES) {
    throw new Error('Rejected invalid or oversized save data.');
  }
  return enqueueSave(async () => {
    await fs.mkdir(saveDirectory, { recursive: true });
    const temporaryPath = `${savePath}.tmp`;
    await fs.writeFile(temporaryPath, text, 'utf8');
    await fs.rename(temporaryPath, savePath);
  });
});

ipcMain.handle('save:clear', (event) => {
  assertTrustedSender(event);
  return enqueueSave(async () => {
    try {
      await fs.unlink(savePath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  });
});

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 720,
    minHeight: 540,
    backgroundColor: '#14122a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.split('#')[0] !== gamePage) event.preventDefault();
  });
  await mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(async () => {
  await createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch((error) => {
  console.error('The desktop game could not be opened.', error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

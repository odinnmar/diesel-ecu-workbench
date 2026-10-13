const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let updateCheckTimer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 980,
    minHeight: 700,
    title: 'Diesel ECU Workbench',
    backgroundColor: '#080d16',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.on('closed', () => { mainWindow = null; });
}

function setupAutoUpdates() {
  // Direct HTML/dev runs and non-Windows builds should never try to update.
  if (!app.isPackaged || process.platform !== 'win32') return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;
  autoUpdater.logger = console;

  autoUpdater.on('checking-for-update', () => console.info('[updater] Checking for updates'));
  autoUpdater.on('update-available', info => console.info(`[updater] Update ${info.version} available; downloading in background`));
  autoUpdater.on('update-not-available', info => console.info(`[updater] Already current (${info.version})`));
  autoUpdater.on('download-progress', p => console.info(`[updater] Download ${Math.round(p.percent)}%`));
  autoUpdater.on('error', err => console.warn('[updater] Update check failed; app remains usable offline:', err.message));
  autoUpdater.on('update-downloaded', async info => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const choice = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      buttons: ['Restart and update', 'Later'],
      defaultId: 0,
      cancelId: 1,
      title: 'Diesel ECU Workbench update ready',
      message: `Version ${info.version} has been downloaded.`,
      detail: 'The update will install when you restart the Workbench. Your app data is kept.'
    });
    if (choice.response === 0) autoUpdater.quitAndInstall(false, true);
  });

  const check = () => autoUpdater.checkForUpdates().catch(err => {
    console.warn('[updater] Update check unavailable:', err.message);
  });
  // Wait for the window to appear before checking; all updater errors are non-fatal.
  setTimeout(check, 8000);
  updateCheckTimer = setInterval(check, 6 * 60 * 60 * 1000);
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  setupAutoUpdates();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  if (updateCheckTimer) clearInterval(updateCheckTimer);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let updateCheckTimer;
let isInstallingUpdate = false;

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
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function sendUpdateState(state, details = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updater:state', {
      state,
      version: app.getVersion(),
      ...details
    });
  }
}

ipcMain.handle('app:get-version', () => ({
  version: app.getVersion(),
  packaged: app.isPackaged,
  platform: process.platform
}));

ipcMain.handle('updater:check', async () => {
  if (!app.isPackaged || process.platform !== 'win32') {
    sendUpdateState('unsupported', {
      message: 'Updates are available in the installed Windows version.'
    });
    return { ok: false, state: 'unsupported' };
  }

  try {
    sendUpdateState('checking', {
      message: 'Checking GitHub Releases…'
    });

    const result = await autoUpdater.checkForUpdates();

    return {
      ok: true,
      version: result?.updateInfo?.version || app.getVersion()
    };
  } catch (error) {
    sendUpdateState('error', {
      message: error.message || 'Could not check for updates.'
    });
    return { ok: false, message: error.message };
  }
});

function setupAutoUpdates() {
  if (!app.isPackaged || process.platform !== 'win32') return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.allowPrerelease = false;
  autoUpdater.logger = console;

  autoUpdater.on('checking-for-update', () => {
    console.info('[updater] Checking for updates');
    sendUpdateState('checking', {
      message: 'Checking GitHub Releases…'
    });
  });

  autoUpdater.on('update-available', info => {
    console.info(`[updater] Update ${info.version} available`);
    sendUpdateState('downloading', {
      availableVersion: info.version,
      message: `Version ${info.version} found. Downloading in background…`
    });
  });

  autoUpdater.on('update-not-available', info => {
    console.info(`[updater] Already current (${info.version})`);
    sendUpdateState('current', {
      message: `You're up to date (${info.version}).`
    });
  });

  autoUpdater.on('download-progress', progress => {
    const percent = Math.round(progress.percent);
    console.info(`[updater] Download ${percent}%`);
    sendUpdateState('downloading', {
      percent,
      message: `Downloading update… ${percent}%`
    });
  });

  autoUpdater.on('error', error => {
    console.warn('[updater] Update failed:', error.message);
    sendUpdateState('error', {
      message: `Update failed: ${error.message}`
    });
  });

  autoUpdater.on('update-downloaded', info => {
    if (isInstallingUpdate) return;
    isInstallingUpdate = true;

    console.info(`[updater] Update ${info.version} downloaded; restarting to install`);
    sendUpdateState('installing', {
      availableVersion: info.version,
      message: `Update ${info.version} downloaded. Restarting to install…`
    });

    // Install silently and restart automatically.
    setImmediate(() => {
      autoUpdater.quitAndInstall(true, true);
    });
  });

  const check = () => {
    if (isInstallingUpdate) return;

    autoUpdater.checkForUpdates().catch(error => {
      console.warn('[updater] Update check unavailable:', error.message);
    });
  };

  setTimeout(check, 8000);
  updateCheckTimer = setInterval(check, 6 * 60 * 60 * 1000);
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  setupAutoUpdates();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  if (updateCheckTimer) clearInterval(updateCheckTimer);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

const isDev = process.env.NODE_ENV === 'development';

autoUpdater.logger = log;
log.transports.file.level = 'info';
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function loadUpdateToken() {
  try {
    const configPath = app.isPackaged
      ? path.join(process.resourcesPath, 'update-config.json')
      : path.join(__dirname, 'update-config.json');
    if (!fs.existsSync(configPath)) return null;
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return cfg.githubToken || null;
  } catch (err) {
    log.error('Falha ao ler update-config.json:', err);
    return null;
  }
}

const updateToken = loadUpdateToken();
if (updateToken) {
  autoUpdater.requestHeaders = {
    Authorization: `token ${updateToken}`,
    Accept: 'application/octet-stream',
  };
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: 'Sistema de Inovações',
    icon: path.join(__dirname, 'build', 'icon.ico'),
    backgroundColor: '#ffffff',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexPath = path.join(process.resourcesPath, 'app', 'index.html');
    win.loadFile(indexPath);
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    const allowed =
      url.startsWith('http://localhost:5173') ||
      url.startsWith('file://');
    if (!allowed) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  buildMenu();

  if (!isDev) {
    setupAutoUpdater(win);
  }
}

function setupAutoUpdater(win) {
  autoUpdater.on('update-available', (info) => {
    log.info('Update disponível:', info.version);
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update baixado:', info.version);
    dialog
      .showMessageBox(win, {
        type: 'info',
        title: 'Atualização disponível',
        message: `Versão ${info.version} pronta para instalar`,
        detail:
          'A atualização será aplicada agora. O app vai reiniciar.\n\nVocê pode adiar e instalar depois ao fechar o app.',
        buttons: ['Reiniciar agora', 'Depois'],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) autoUpdater.quitAndInstall();
      });
  });

  autoUpdater.on('error', (err) => {
    log.error('Erro no auto-update:', err);
  });

  autoUpdater.checkForUpdatesAndNotify().catch((err) => {
    log.error('Falha ao verificar updates:', err);
  });

  setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 60 * 60 * 1000);
}

function buildMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [{ role: 'quit', label: 'Sair' }],
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectAll', label: 'Selecionar tudo' },
      ],
    },
    {
      label: 'Visualizar',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { role: 'forceReload', label: 'Forçar recarga' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom padrão' },
        { role: 'zoomIn', label: 'Aumentar zoom' },
        { role: 'zoomOut', label: 'Diminuir zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela cheia' },
        ...(isDev ? [{ role: 'toggleDevTools', label: 'DevTools' }] : []),
      ],
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox({
              type: 'info',
              title: 'Sobre',
              message: 'Sistema de Inovações',
              detail: `Versão ${app.getVersion()}\nTop Construtora`,
            });
          },
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

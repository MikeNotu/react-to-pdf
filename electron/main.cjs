const { app, BrowserWindow } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const url = require("node:url");

const isDev = !app.isPackaged;

function createWindow() {
  const devIconIcoPath = path.join(__dirname, "..", "build", "icon.ico");
  const devIconPngPath = path.join(__dirname, "..", "src", "assets", "favicon.png");
  const iconPath = isDev
    ? (fs.existsSync(devIconIcoPath) ? devIconIcoPath : devIconPngPath)
    : path.join(process.resourcesPath, "icon.ico");

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 960,
    minHeight: 720,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.maximize();

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
    return;
  }

  const indexPath = path.join(__dirname, "..", "dist", "index.html");
  mainWindow.loadURL(url.pathToFileURL(indexPath).toString());
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

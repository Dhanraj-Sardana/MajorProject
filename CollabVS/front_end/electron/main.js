const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { exec } = require("child_process");

let mainWindow;
let conflictWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });
 
    mainWindow.loadURL("http://localhost:5173"); // Vite dev server
}

ipcMain.on("open-conflict-window", (event, conflictText) => {
    if (conflictWindow) {
        conflictWindow.focus();
        return;
    }

    conflictWindow = new BrowserWindow({
        width: 600,
        height: 400,
        parent: mainWindow,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
        modal:true,
    });

    conflictWindow.on("closed", () => {
        conflictWindow = null;
      
    });

    conflictWindow.loadURL("http://localhost:5173/conflict");

    conflictWindow.webContents.on("did-finish-load", () => {
        conflictWindow.webContents.send("conflict-data", conflictText);
    });
});
app.whenReady().then(createWindow);

let remoteWindow = null;

function createRemoteWindow() {
  if (remoteWindow) {
    remoteWindow.focus();
    return;
  }

  remoteWindow = new BrowserWindow({
    fullscreen: true,
    parent: mainWindow,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    modal: true,
  });

  remoteWindow.loadURL("http://localhost:5173/remote");

  remoteWindow.on("closed", () => {
    remoteWindow = null;
  });
}

ipcMain.handle("run-command", async (_, command) => {
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            if (stderr.includes("CONFLICT") || stdout.includes("<<<<<<<")) {
                // Trigger conflict window
                openConflictWindow(stderr || stdout);
            }

            resolve(stderr || stdout || error?.message || "Unknown error");
        });
    });
});
ipcMain.on("open-remote-window", () => {
    createRemoteWindow();
  });
ipcMain.on("close-conflict-window", () => {
    if (conflictWindow) {
        conflictWindow.close();
        conflictWindow = null;
    }
});

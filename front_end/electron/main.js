const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { exec } = require("child_process");

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    win.loadURL("http://localhost:5173"); // Vite dev server
}

app.whenReady().then(createWindow);

ipcMain.handle("run-command", async (_, command) => {
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            if (error) resolve(stderr || error.message);
            else resolve(stdout);
        });
    });
});
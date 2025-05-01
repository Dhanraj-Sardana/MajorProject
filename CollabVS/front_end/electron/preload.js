const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    runCommand: (cmd) => ipcRenderer.invoke("run-command", cmd),

    onConflictData: (callback) =>
        ipcRenderer.on("conflict-data", (_, data) => callback(data)),

    openConflictWindow: (conflictText) =>
        ipcRenderer.send("open-conflict-window", conflictText),

    closeConflictWindow: () => ipcRenderer.send("close-conflict-window"),
    openRemoteWindow: () => ipcRenderer.send("open-remote-window"),
});
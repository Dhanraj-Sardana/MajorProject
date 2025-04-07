const fs = require("fs");
const path = require("path");
const CVS_DIR = ".mycvs";

function push(remotePath) {
    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized");
            return;
        }
        if (!fs.existsSync(remotePath)) {
            console.log("Remote repository does not exist.");
            return;
        }


        fs.cpSync(CVS_DIR, path.join(remotePath, CVS_DIR), { recursive: true });
        console.log("Pushed changes to remote repository.");
    } catch (err) {
        console.log("Error pushing:", err.message);
    }
}


module.exports={push};
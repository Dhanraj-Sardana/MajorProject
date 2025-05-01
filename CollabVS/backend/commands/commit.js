const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const CVS_DIR = "../../CVS/mycvs";

function commit(message) {
    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized");
            return;
        }

        const targetBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
        const branchPath = path.join(CVS_DIR, "branches", `${targetBranch}.json`);
        const commitHistoryPath = path.join(CVS_DIR, "branches", `${targetBranch}-history.json`);

        if (!fs.existsSync(branchPath)) {
            console.log("Branch does not exist.");
            return;
        }

        const index = JSON.parse(fs.readFileSync(branchPath, "utf8"));

        if (Object.keys(index).length === 0) {
            console.log("No changes to commit.");
            return;
        }

        const commitHash = crypto.createHash("sha1").update(Date.now().toString()).digest("hex").slice(0, 7);
        const commitDir = path.join(CVS_DIR, "commits", commitHash);

        //Store commit history separately**
        let commitHistory = [];
        try {
            if (fs.existsSync(commitHistoryPath)) {
                commitHistory = JSON.parse(fs.readFileSync(commitHistoryPath, "utf8"));
            }
        } catch (err) {
            commitHistory = [];
        }

        commitHistory.push(commitHash);
        fs.writeFileSync(commitHistoryPath, JSON.stringify(commitHistory, null, 2));

        // Create commit directory
        fs.mkdirSync(commitDir);

        // Save files in the commit directory
        Object.entries(index).forEach(([file, content]) => {
            fs.writeFileSync(path.join(commitDir, file), content);
        });

        // Save commit message
        fs.writeFileSync(path.join(commitDir, "message.txt"), message);

        // 🛠 **Fix: Do not erase commit history, just clear staging**
        fs.writeFileSync(branchPath, JSON.stringify({}, null, 2));

        console.log(`Committed with ID ${commitHash}.`);
    } catch (err) {
        console.log("Error in commiting :", err.message);
    }
}

module.exports={commit};
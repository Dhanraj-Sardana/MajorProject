const fs = require("fs");
const path = require("path");
const CVS_DIR = "../../CVS/mycvs";

function logCommits() {
    if (!fs.existsSync(CVS_DIR)) {
        console.log("Repository is not initialized");
        return;
    }

    const branchName = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
    const commitHistoryPath = path.join(CVS_DIR, "branches", `${branchName}-history.json`);

    if (!fs.existsSync(commitHistoryPath)) {
        console.log("No commits found.");
        return;
    }

    const commits = JSON.parse(fs.readFileSync(commitHistoryPath, "utf8"));

    if (!Array.isArray(commits) || commits.length === 0) {
        console.log("No commits found.");
        return;
    }

    const commitsDir = path.join(CVS_DIR, "commits");

    commits.forEach(commit => {
        const messagePath = path.join(commitsDir, commit, "message.txt");
        if (fs.existsSync(messagePath)) {
            const message = fs.readFileSync(messagePath, "utf8");
            console.log(`Commit ${commit}: ${message}`);
        } else {
            console.log(`Commit ${commit}: (No message found)`);
        }
    });
}

module.exports={logCommits};


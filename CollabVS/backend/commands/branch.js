const fs = require("fs");
const path = require("path");
const CVS_DIR = "../../CVS/mycvs";

function createBranch(branchName) {
    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized.");
            return;
        }

        const branchPath = path.join(CVS_DIR, "branches", `${branchName}.json`);
        if (fs.existsSync(branchPath)) {
            console.log("Branch already exists.");
            return;
        }

        const currentBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
        const currentHistoryPath = path.join(CVS_DIR, "branches", `${currentBranch}-history.json`);
        const newHistoryPath = path.join(CVS_DIR, "branches", `${branchName}-history.json`);

        let latestCommit = null;
        if (fs.existsSync(currentHistoryPath)) {
            const history = JSON.parse(fs.readFileSync(currentHistoryPath, "utf8"));
            if (history.length > 0) {
                latestCommit = history[history.length - 1];
            }
        }

        fs.writeFileSync(branchPath, JSON.stringify([], null, 2));
        fs.writeFileSync(newHistoryPath, JSON.stringify(latestCommit ? [latestCommit] : [], null, 2));

        console.log(`Branch '${branchName}' created.`);
        if (latestCommit) {
            console.log(`Copied latest commit '${latestCommit}' from '${currentBranch}' branch.`);
        }
    } catch (err) {
        console.log("Error creating branch:", err.message);
    }
}

module.exports={createBranch};
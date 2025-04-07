const fs = require("fs");
const path = require("path");
const CVS_DIR = ".mycvs";

function switchBranch(branchName) {
    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized");
            return;
        }

        const branchPath = path.join(CVS_DIR, "branches", `${branchName}.json`);
        if (!fs.existsSync(branchPath)) {
            console.log("Branch does not exist.");
            return;
        }

        // Get current branch name
        const currentBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();

        // Save current state before switching (if there's an active branch)
        if (currentBranch) {
            const currentFiles = fs.readdirSync(".").filter(file => (
                !file.startsWith(".") && fs.lstatSync(file).isFile() && file !== "cvs.js"
            ));

            // Save current working directory state in a separate file
            fs.writeFileSync(path.join(CVS_DIR, "branches", `${currentBranch}-state.json`), JSON.stringify(currentFiles, null, 2));
        }

        // Clear current working directory (excluding CVS system files & `cvs.js`)
        fs.readdirSync(".").forEach(file => {
            if (!file.startsWith(".") && fs.lstatSync(file).isFile() && file !== "cvs.js") {
                fs.unlinkSync(file);
            }
        });

        // Update HEAD to new branch
        fs.writeFileSync(path.join(CVS_DIR, "HEAD"), branchName);
        console.log(`Switched to branch '${branchName}'.`);

        // Restore last saved state (if any)
        const savedStatePath = path.join(CVS_DIR, "branches", `${branchName}-state.json`);
        if (fs.existsSync(savedStatePath)) {
            const savedFiles = JSON.parse(fs.readFileSync(savedStatePath, "utf8"));
            savedFiles.forEach(file => {
                const latestCommitPath = path.join(CVS_DIR, "commits");
                const commitHistoryPath = path.join(CVS_DIR, "branches", `${branchName}-history.json`);

                if (fs.existsSync(commitHistoryPath)) {
                    const commitHistory = JSON.parse(fs.readFileSync(commitHistoryPath, "utf8"));
                    if (commitHistory.length > 0) {
                        const latestCommit = commitHistory[commitHistory.length - 1];
                        const filePath = path.join(latestCommitPath, latestCommit, file);

                        if (fs.existsSync(filePath)) {
                            const content = fs.readFileSync(filePath, "utf8");
                            fs.writeFileSync(file, content);
                        }
                    }
                }
            });
        }

    } catch (err) {
        console.log("Error in switching branch:", err.message);
    }
}

module.exports = {
    switchBranch,
};
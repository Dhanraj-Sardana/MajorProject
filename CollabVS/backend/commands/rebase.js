const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const CVS_DIR = "../../CVS/mycvs";
const BRANCHES_DIR = path.join(CVS_DIR, "branches");
const COMMITS_DIR = path.join(CVS_DIR, "commits");
const HEAD_FILE = path.join(CVS_DIR, "HEAD");

function generateCommitHash() {
    return crypto.randomBytes(6).toString("hex");
}

function rebase(targetBranch) {

    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized.");
            return;
        }

        if (!fs.existsSync(HEAD_FILE)) {
            console.log("HEAD file not found. Unable to rebase.");
            return;
        }

        const currentBranch = fs.readFileSync(HEAD_FILE, "utf-8").trim();
        if (currentBranch === targetBranch) {
            console.log("Already on the target branch. No rebase needed.");
            return;
        }

        const targetHistoryPath = path.join(BRANCHES_DIR, `${targetBranch}-history.json`);
        const sourceHistoryPath = path.join(BRANCHES_DIR, `${currentBranch}-history.json`);

        if (!fs.existsSync(targetHistoryPath) || !fs.existsSync(sourceHistoryPath)) {
            console.log("One of the branch histories is missing.");
            return;
        }

        const targetHistory = JSON.parse(fs.readFileSync(targetHistoryPath, "utf-8"));
        const sourceHistory = JSON.parse(fs.readFileSync(sourceHistoryPath, "utf-8`"));

        // Find common ancestor
        let commonAncestorIndex = -1;
        for (let i = sourceHistory.length - 1; i >= 0; i--) {
            if (targetHistory.includes(sourceHistory[i])) {
                commonAncestorIndex = i;
                break;
            }
        }

        if (commonAncestorIndex === -1) {
            console.log("No common ancestor found. Unable to rebase.");
            return;
        }

        const newCommits = sourceHistory.slice(commonAncestorIndex + 1);
        if (newCommits.length === 0) {
            console.log("No new commits to rebase.");
            return;
        }

        console.log(`ebasing ${newCommits.length} commits from '${currentBranch}' onto '${targetBranch}'...`);

        let rebasedCommits = [];
        let conflictsDetected = false;

        for (const oldCommit of newCommits) {
            console.log(`Applying commit: ${oldCommit}`);

            const oldCommitPath = path.join(COMMITS_DIR, oldCommit);
            if (!fs.existsSync(oldCommitPath)) {
                console.log(`Commit ${oldCommit} not found. Skipping.`);
                continue;
            }

            const newCommitHash = generateCommitHash();
            const newCommitPath = path.join(COMMITS_DIR, newCommitHash);
            fs.mkdirSync(newCommitPath, { recursive: true });

            fs.readdirSync(oldCommitPath).forEach(file => {
                if (file === "message.txt") return;

                const sourceFilePath = path.join(oldCommitPath, file);
                const destFilePath = path.join(newCommitPath, file);
                const workingFilePath = path.join(process.cwd(), file);

                const sourceContent = fs.readFileSync(sourceFilePath, "utf-8");
                let targetContent = "";

                if (fs.existsSync(workingFilePath)) {
                    targetContent = fs.readFileSync(workingFilePath, "utf-8");

                    if (sourceContent !== targetContent) {
                        // Conflict detected
                        conflictsDetected = true;
                        console.log(`Conflict detected in file: ${file}`);

                        const conflictContent =
                            `<<<<<<< current version (${targetBranch})\n` +
                            `${targetContent}\n=======\n${sourceContent}\n>>>>>>> rebased commit\n`;

                        fs.writeFileSync(workingFilePath, conflictContent, "utf-8");
                        fs.writeFileSync(destFilePath, conflictContent, "utf-8");

                        console.log(`Manual resolution needed in file: ${file}`);
                        return;
                    }
                }

                // No conflict
                fs.copyFileSync(sourceFilePath, destFilePath);
                fs.copyFileSync(sourceFilePath, workingFilePath);
            });

            // Preserve commit message
            const messageFile = path.join(oldCommitPath, "message.txt");
            if (fs.existsSync(messageFile)) {
                fs.copyFileSync(messageFile, path.join(newCommitPath, "message.txt"));
            }

            rebasedCommits.push(newCommitHash);
        }

        if (conflictsDetected) {
            console.log("Rebase paused due to conflicts. Please resolve them manually and rerun the rebase.");
            return;
        }

        // Update target branch history and HEAD
        const updatedHistory = [...targetHistory, ...rebasedCommits];
        fs.writeFileSync(targetHistoryPath, JSON.stringify(updatedHistory, null, 2));
        fs.writeFileSync(HEAD_FILE, targetBranch);
        console.log("Rebase completed successfully.");
    } catch (err) {
        console.log("Error in rebase:", err.message);
    }
}

module.exports={rebase};
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const CVS_DIR = ".mycvs";

const mergeBranch = (sourceBranch) => {
    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized");
            return;
        }

        const targetBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();

        if (sourceBranch === targetBranch) {
            console.log("Source and target branches are the same.");
            return;
        }

        const sourceHistoryPath = path.join(CVS_DIR, "branches", `${sourceBranch}-history.json`);
        const targetHistoryPath = path.join(CVS_DIR, "branches", `${targetBranch}-history.json`);
        const sourceStatePath = path.join(CVS_DIR, "branches", `${sourceBranch}-state.json`);
        const targetStatePath = path.join(CVS_DIR, "branches", `${targetBranch}-state.json`);

        if (!fs.existsSync(sourceHistoryPath) || !fs.existsSync(targetHistoryPath)) {
            console.log("One or both branches do not have commit history.");
            return;
        }

        const sourceHistory = JSON.parse(fs.readFileSync(sourceHistoryPath, "utf8"));
        const targetHistory = JSON.parse(fs.readFileSync(targetHistoryPath, "utf8"));
        const sourceState = fs.existsSync(sourceStatePath) ? JSON.parse(fs.readFileSync(sourceStatePath, "utf8")) : [];
        const targetState = fs.existsSync(targetStatePath) ? JSON.parse(fs.readFileSync(targetStatePath, "utf8")) : [];

        if (sourceHistory.length === 0 || targetHistory.length === 0) {
            console.log("One or both branches have no commits to merge.");
            return;
        }

        const latestSourceCommit = sourceHistory[sourceHistory.length - 1];
        const latestTargetCommit = targetHistory[targetHistory.length - 1];

        const sourceCommitPath = path.join(CVS_DIR, "commits", latestSourceCommit);
        const targetCommitPath = path.join(CVS_DIR, "commits", latestTargetCommit);

        let mergedFiles = {};
        let conflicts = [];


        // Process source branch files
        sourceState.forEach(file => {
            const sourceFilePath = path.join(sourceCommitPath, file);
            const targetFilePath = path.join(targetCommitPath, file);

            if (fs.existsSync(sourceFilePath)) {
                const sourceContent = fs.readFileSync(sourceFilePath, "utf8");

                if (fs.existsSync(targetFilePath)) {
                    const targetContent = fs.readFileSync(targetFilePath, "utf8");

                    if (sourceContent !== targetContent) {
                        // Conflict detected
                        const conflictFile = `${file}.conflict`;
                        fs.writeFileSync(conflictFile, `<<<<<<< ${sourceBranch}\n${sourceContent}\n=======\n${targetContent}\n>>>>>>> ${targetBranch}`);
                        conflicts.push(file);
                    } else {
                        mergedFiles[file] = sourceContent;
                    }
                } else {
                    mergedFiles[file] = sourceContent;
                }
            }
        });

        // Add unique files from the target branch
        targetState.forEach(file => {
            if (!mergedFiles[file] && fs.existsSync(path.join(targetCommitPath, file))) {
                mergedFiles[file] = fs.readFileSync(path.join(targetCommitPath, file), "utf8");
            }
        });

        // Save merged files if no conflicts
        if (conflicts.length === 0) {
            const newCommitHash = crypto.createHash("sha1").update(Date.now().toString()).digest("hex").slice(0, 7);
            const newCommitDir = path.join(CVS_DIR, "commits", newCommitHash);

            fs.mkdirSync(newCommitDir);
            Object.entries(mergedFiles).forEach(([file, content]) => {
                fs.writeFileSync(path.join(newCommitDir, file), content);
                fs.writeFileSync(path.join(newCommitDir, "message.txt"), `Branch '${sourceBranch}' successfully merged into '${targetBranch}'.`);
            });

            // Update history and state for the target branch
            targetHistory.push(newCommitHash);
            fs.writeFileSync(targetHistoryPath, JSON.stringify(targetHistory, null, 2));
            fs.writeFileSync(targetStatePath, JSON.stringify(Object.keys(mergedFiles), null, 2));

            console.log(`Branch '${sourceBranch}' successfully merged into '${targetBranch}'.`);
            //....... delete conflict file here
            fs.readdirSync(".").forEach(file => {
                if (file.endsWith(".conflict")) {
                    fs.unlinkSync(file); // Delete conflict file
                }
            });
        } else {
            console.log("Merge completed with conflicts in:", conflicts);
            console.log("Resolve the conflicts manually in .conflict files.");
        }
    } catch (err) {
        console.error("Error merging branches:", err);
    }
};

module.exports = {mergeBranch};

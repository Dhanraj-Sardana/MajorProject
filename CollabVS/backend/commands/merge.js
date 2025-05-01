const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const CVS_DIR = "../../CVS/mycvs";

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
        const sourceState = fs.existsSync(sourceStatePath) ? JSON.parse(fs.readFileSync(sourceStatePath, "utf8")) : {};
        const targetState = fs.existsSync(targetStatePath) ? JSON.parse(fs.readFileSync(targetStatePath, "utf8")) : {};

        if (sourceHistory.length === 0 || targetHistory.length === 0) {
            console.log("One or both branches have no commits to merge.");
            return;
        }

        const mergedFiles = {};
        const conflicts = [];

        // Merge files from sourceState
        Object.entries(sourceState).forEach(([file, sourceContent]) => {
            const targetContent = targetState[file];
                
            if (targetContent !== undefined && sourceContent !== targetContent) {
                // Conflict
                const conflictFile = `${file}.conflict`;
                console.log("CONFLICT: CVS/" + conflictFile); 
   
                fs.writeFileSync(path.join("../../CVS",conflictFile),
                    `<<<<<<< ${sourceBranch}\n${sourceContent}\n=======\n${targetContent}\n>>>>>>> ${targetBranch}`
                );
                conflicts.push(file);
            } else {
                mergedFiles[file] = sourceContent;
            }
        });

        // Add unique files from targetState (not already merged)
        Object.entries(targetState).forEach(([file, content]) => {
            if (!mergedFiles[file]) {
                mergedFiles[file] = content;
            }
        });

        if (conflicts.length === 0) {
            const newCommitHash = crypto.createHash("sha1").update(Date.now().toString()).digest("hex").slice(0, 7);
            const newCommitDir = path.join(CVS_DIR, "commits", newCommitHash);
            fs.mkdirSync(newCommitDir);

            // Save merged files to new commit
            Object.entries(mergedFiles).forEach(([file, content]) => {
                fs.writeFileSync(path.join(newCommitDir, file), content);
            });

            // Save commit message
            fs.writeFileSync(path.join(newCommitDir, "message.txt"), `Branch '${sourceBranch}' successfully merged into '${targetBranch}'.`);

            // Update target branch history and state
            targetHistory.push(newCommitHash);
            fs.writeFileSync(targetHistoryPath, JSON.stringify(targetHistory, null, 2));
            fs.writeFileSync(targetStatePath, JSON.stringify(mergedFiles, null, 2));

            // Clean up conflict files if any exist
            fs.readdirSync("../../CVS").forEach(file => {
                if (file.endsWith(".conflict")) {
                    fs.unlinkSync(path.join("../../CVS", file));
                }
            });

            console.log(`Branch '${sourceBranch}' successfully merged into '${targetBranch}'.`);
        } else {
            console.log("Merge completed with conflicts in:", conflicts);
            console.log("Resolve the conflicts manually in .conflict files.");
        }

    } catch (err) {
        console.error("Error merging branches:", err);
    }
};

module.exports = { mergeBranch };

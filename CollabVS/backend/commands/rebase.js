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
        const sourceHistory = JSON.parse(fs.readFileSync(sourceHistoryPath, "utf-8"));

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

        const newCommit = sourceHistory[commonAncestorIndex];
        console.log(newCommit);
        
        if (newCommit.length === 0) {
            console.log("No new commits to rebase.");
            return;
        }

        console.log(`rebasing ${newCommit} commit from '${currentBranch}' onto '${targetBranch}'...`);

        let conflictsDetected = false;

            console.log(`Applying commit: ${newCommit}`);

            const oldCommitPath = path.join(COMMITS_DIR, newCommit);
            if (!fs.existsSync(oldCommitPath)) {
                console.log(`Commit ${newCommit} not found. Skipping.`);
            }

            fs.readdirSync(oldCommitPath).forEach(file => {
                if (file === "message.txt") return;
                let conflicts = [];
                const sourceFilePath = path.join(oldCommitPath, file);
               fs.readdirSync("../../CVS").forEach(File=>{
                
                if(file===File){
                    const sourceFileContent=fs.readFileSync(path.join("../../CVS",File),'utf-8');
                    const targetFileContent=fs.readFileSync(path.join(oldCommitPath,file),'utf-8');
                    
                    if (sourceFileContent !== targetFileContent) {
                        // Conflict detected
                        conflictsDetected = true;
                        console.log(`Conflict detected in file: ${file}`);

                        const conflictContent =
                            `<<<<<<< current version (${targetFileContent})\n` +
                            `${targetFileContent}\n=======\n${sourceFileContent}\n>>>>>>> rebased commit\n`;

                            const conflictFile = `${file}.conflict`;
                            console.log("CONFLICT: CVS/" + conflictFile);
                            fs.writeFileSync(path.join("../../CVS",conflictFile),conflictContent);
                            conflicts.push(file);
                        }
               }
            })
               if (conflicts.length === 0) {
                        // No conflict
                        const contents=[];
                        for (let i =0 ; i < sourceHistory.length ; i++) {
                            if (targetHistory.includes(sourceHistory[i])) {
                                contents.push(targetHistory[targetHistory.length-1])
                                continue;
                            }
                            contents.push(sourceHistory[i])
                        }
                        fs.writeFileSync(sourceHistoryPath,JSON.stringify(contents, null, 2))
               }
            
            });

        console.log("Rebase completed successfully.");
    } catch (err) {
        console.log("Error in rebase:", err.message);
    }
}

module.exports={rebase};
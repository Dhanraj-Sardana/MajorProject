const fs = require("fs");
const path = require("path");
const CVS_DIR = ".mycvs";

function clone(remotePath) {
    try {
        if (!fs.existsSync(remotePath)) {
            console.log("Remote repository does not exist.");
            return;
        }

        if (!fs.existsSync(CVS_DIR)) {
            fs.mkdirSync(CVS_DIR);
        }

        // Copy .mycvs directory
        fs.cpSync(path.join(remotePath, CVS_DIR), CVS_DIR, { recursive: true });
        console.log("Cloned the .mycvs folder.");

        // Identify the current branch
        const headFilePath = path.join(CVS_DIR, "HEAD");
        if (!fs.existsSync(headFilePath)) {
            console.log("HEAD file not found. Cloning without branch-specific files.");
            return;
        }

        const currentBranch = fs.readFileSync(headFilePath, "utf-8").trim();
        console.log(`Current branch: ${currentBranch}`);

        // Find the latest commit hash for the current branch
        const branchHistoryPath = path.join(CVS_DIR, "branches", `${currentBranch}-history.json`);
        if (!fs.existsSync(branchHistoryPath)) {
            console.log(`No commit history found for branch: ${currentBranch}`);
            return;
        }

        const branchHistory = JSON.parse(fs.readFileSync(branchHistoryPath, "utf-8"));
        if (branchHistory.length === 0) {
            console.log(`Branch ${currentBranch} has no commits.`);
            return;
        }

        const latestCommitHash = branchHistory[branchHistory.length - 1]; // Get the latest commit
        console.log(`Latest commit hash: ${latestCommitHash}`);

        // Copy files from the latest commit OUTSIDE of .mycvs
        const remoteCommitPath = path.join(remotePath, CVS_DIR, "commits", latestCommitHash);
        let conflicts = [];

        if (fs.existsSync(remoteCommitPath)) {
            for (const file of fs.readdirSync(remoteCommitPath)) {
                if (file === "message.txt") continue;  // Skip commit message file

                const destFilePath = path.join(process.cwd(), file); // Place files in working directory
                const srcFilePath = path.join(remoteCommitPath, file);

                if (fs.existsSync(destFilePath)) {
                    // Conflict detected, but we don't resolve it
                    conflicts.push(file);
                } else {
                    fs.copyFileSync(srcFilePath, destFilePath);
                    console.log(`Copied: ${file}`);
                }
            }

            console.log("Cloned the latest commit files into the working directory.");
        } else {
            console.log("No files found for the latest commit.");
        }

        // Display conflict warning
        if (conflicts.length > 0) {
            console.log("\n Conflicts detected! The following files already exist in the working directory:");
            conflicts.forEach(file => console.log(`   - ${file}`));
            console.log("\nResolve conflicts manually before proceeding.");
        }

    } catch (err) {
        console.log("Error cloning:", err.message);
    }
}
 module.exports={clone};
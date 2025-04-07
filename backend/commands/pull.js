const fs = require("fs");
const path = require("path");
const CVS_DIR = ".mycvs";

function pull(remoteRepoPath) {
    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized.");
            return;
        }

        if (!fs.existsSync(remoteRepoPath)) {
            console.log("Remote repository does not exist.");
            return;
        }

        console.log("Fetching updates from remote repository...");
        fetch(remoteRepoPath);

        console.log("Merging fetched changes into the working directory...");

        const localRemoteDir = path.join(CVS_DIR, "remote");
        const localCommitsPath = path.join(localRemoteDir, "commits");
        const localBranchesPath = path.join(localRemoteDir, "branches");

        const localCommitsDest = path.join(CVS_DIR, "commits");
        const localBranchesDest = path.join(CVS_DIR, "branches");

        // Merge fetched commits
        if (fs.existsSync(localCommitsPath)) {
            fs.readdirSync(localCommitsPath).forEach(commitHash => {
                const fetchedCommitPath = path.join(localCommitsPath, commitHash);
                const localCommitPath = path.join(localCommitsDest, commitHash);

                if (!fs.existsSync(localCommitPath)) {
                    fs.mkdirSync(localCommitPath, { recursive: true });

                    fs.readdirSync(fetchedCommitPath).forEach(file => {
                        fs.copyFileSync(
                            path.join(fetchedCommitPath, file),
                            path.join(localCommitPath, file)
                        );
                    });
                }
            });
        }

        // Merge fetched branches
        if (fs.existsSync(localBranchesPath)) {
            fs.readdirSync(localBranchesPath).forEach(branchFile => {
                const fetchedBranchFilePath = path.join(localBranchesPath, branchFile);
                const localBranchFilePath = path.join(localBranchesDest, branchFile);

                fs.copyFileSync(fetchedBranchFilePath, localBranchFilePath);
            });
        }

        console.log("Pull successful. Latest changes merged into the local repository.");
    } catch (err) {
        console.error("Error pulling from remote repository:", err.message);
    }
}

module.exports={pull};
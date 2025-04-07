const fs = require("fs");
const path = require("path");
const CVS_DIR = ".mycvs";

function fetch(remoteRepoPath) {
    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized.");
            return;
        }

        if (!fs.existsSync(remoteRepoPath)) {
            console.log("Remote repository does not exist.");
            return;
        }

        const remoteBranchesPath = path.join(remoteRepoPath, "branches");
        const remoteCommitsPath = path.join(remoteRepoPath, "commits");
        const localRemoteDir = path.join(CVS_DIR, "remote");
        const localCommitsPath = path.join(localRemoteDir, "commits");

        // Ensure the "remote" directory exists
        if (!fs.existsSync(localRemoteDir)) {
            fs.mkdirSync(localRemoteDir, { recursive: true });
        }

        // Fetch branches
        if (fs.existsSync(remoteBranchesPath)) {
            fs.readdirSync(remoteBranchesPath).forEach(branchFile => {
                const remoteBranchFilePath = path.join(remoteBranchesPath, branchFile);
                const localBranchFilePath = path.join(localRemoteDir, branchFile);

                fs.copyFileSync(remoteBranchFilePath, localBranchFilePath);
            });
        }

        // Fetch new commits only
        if (!fs.existsSync(localCommitsPath)) {
            fs.mkdirSync(localCommitsPath, { recursive: true });
        }

        if (fs.existsSync(remoteCommitsPath)) {
            fs.readdirSync(remoteCommitsPath).forEach(commitHash => {
                const remoteCommitPath = path.join(remoteCommitsPath, commitHash);
                const localCommitPath = path.join(localCommitsPath, commitHash);

                if (!fs.existsSync(localCommitPath)) {
                    fs.mkdirSync(localCommitPath, { recursive: true });

                    fs.readdirSync(remoteCommitPath).forEach(file => {
                        fs.copyFileSync(
                            path.join(remoteCommitPath, file),
                            path.join(localCommitPath, file)
                        );
                    });
                }
            });
        }

        console.log("Fetch successful. Updates are stored in the 'remote' directory.");
    } catch (err) {
        console.error("Error fetching from remote repository:", err.message);
    }
}

module.exports={fetch};
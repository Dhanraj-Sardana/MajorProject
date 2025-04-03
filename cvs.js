const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline");
const { log } = require("console");

const CVS_DIR = ".mycvs";
const INDEX_FILE = path.join(CVS_DIR, "index.json");
const STASH_DIR = path.join(CVS_DIR, "stash");
// Initialize a repository
function initRepo() {
    if (!fs.existsSync(CVS_DIR)) {
        fs.mkdirSync(CVS_DIR);
        fs.mkdirSync(path.join(CVS_DIR, "commits"));
        fs.mkdirSync(path.join(CVS_DIR, "branches"));
        fs.writeFileSync(path.join(CVS_DIR, "HEAD"), "main"); // Default branch
        fs.writeFileSync(path.join(CVS_DIR, "branches", "main.json"), JSON.stringify([], null, 2));
        //fs.writeFileSync(INDEX_FILE, JSON.stringify({}, null, 2));
        console.log("Initialized an empty repository with 'main' branch.");
    } else {
        console.log("Repository already exists.");
    }
}


// Stage a file
function addFile(...filenames) {
    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized");
            return;
        }

        const targetBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
        const branchPath = path.join(CVS_DIR, "branches", `${targetBranch}.json`);

        // Read existing staged files
        let index = {};
        if (fs.existsSync(branchPath)) {
            index = JSON.parse(fs.readFileSync(branchPath, "utf8"));
        }

        filenames.forEach(filename => {
            if (fs.existsSync(filename)) {
                const content = fs.readFileSync(filename, "utf8");
                index[filename] = content;
                console.log(`Staged ${filename}.`);
            } else {
                console.log(`File '${filename}' does not exist.`);
            }
        });

        // Update the staging area
        fs.writeFileSync(branchPath, JSON.stringify(index, null, 2));
    } catch (err) {
        console.log("Error adding files:", err);
    }
}



// Commit staged files
function commit(message) {
    if (!fs.existsSync(CVS_DIR)) {
        console.log("Repository is not initialized");
        return;
    }

    const targetBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
    const branchPath = path.join(CVS_DIR, "branches", `${targetBranch}.json`);
    const commitHistoryPath = path.join(CVS_DIR, "branches", `${targetBranch}-history.json`);

    if (!fs.existsSync(branchPath)) {
        console.log("Branch does not exist.");
        return;
    }

    const index = JSON.parse(fs.readFileSync(branchPath, "utf8"));

    if (Object.keys(index).length === 0) {
        console.log("No changes to commit.");
        return;
    }

    const commitHash = crypto.createHash("sha1").update(Date.now().toString()).digest("hex").slice(0, 7);
    const commitDir = path.join(CVS_DIR, "commits", commitHash);

    //Store commit history separately**
    let commitHistory = [];
    try {
        if (fs.existsSync(commitHistoryPath)) {
            commitHistory = JSON.parse(fs.readFileSync(commitHistoryPath, "utf8"));
        }
    } catch (err) {
        commitHistory = [];
    }

    commitHistory.push(commitHash);
    fs.writeFileSync(commitHistoryPath, JSON.stringify(commitHistory, null, 2));

    // Create commit directory
    fs.mkdirSync(commitDir);

    // Save files in the commit directory
    Object.entries(index).forEach(([file, content]) => {
        fs.writeFileSync(path.join(commitDir, file), content);
    });

    // Save commit message
    fs.writeFileSync(path.join(commitDir, "message.txt"), message);

    // 🛠 **Fix: Do not erase commit history, just clear staging**
    fs.writeFileSync(branchPath, JSON.stringify({}, null, 2));

    console.log(`Committed with ID ${commitHash}.`);
}

// View commit history
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


// Restore a commit
function checkout(commitId) {

    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized");
            return;
        }
        const commitPath = path.join(CVS_DIR, "commits", commitId);
        if (!fs.existsSync(commitPath)) {
            console.log("Commit does not exist.");
            return;
        }

        fs.readdirSync(commitPath).forEach(file => {
            if (file !== "message.txt") {
                const content = fs.readFileSync(path.join(commitPath, file), "utf8");
                fs.writeFileSync(file, content);
            }
        });

        console.log(`Checked out commit ${commitId}.`);
    } catch (err) {
        if (!commitId) {
            console.log("No commit id");

        }
    }
}
//create branch
function createBranch(branchName) {
    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized");
            return;
        }
        const branchPath = path.join(CVS_DIR, "branches", `${branchName}.json`);
        if (fs.existsSync(branchPath)) {
            console.log("Branch already exists.");
            return;
        }

        fs.writeFileSync(branchPath, JSON.stringify([], null, 2));
        console.log(`Branch '${branchName}' created.`);
    } catch (ERR) {
        console.log("NO Branchname");

    }
}

//Switch to a Branch
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
        console.log("No Branchname");
    }
}

//Merging Branches
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

//push
function push(remotePath) {
    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized");
            return;
        }
        if (!fs.existsSync(remotePath)) {
            console.log("Remote repository does not exist.");
            return;
        }

        fs.cpSync(CVS_DIR, remotePath, { recursive: true });
        console.log("Pushed changes to remote repository.");
    } catch (err) {
        console.log("No RemotePath");

    }
}
//Clone
function clone(remotePath) {
    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized");
            return;
        }
        if (!fs.existsSync(remotePath)) {
            console.log("Remote repository does not exist.");
            return;
        }
           
        fs.cpSync(remotePath, CVS_DIR, { recursive: true });
        console.log("cloned the changes from remote repository.");
    }
    catch (err) {
        console.log("No RemotePath");

    }
}

//current branch
function status() {

    if (!fs.existsSync(CVS_DIR)) {
        console.log("No Repository  exists! so can not tell about branch");
    } else {
        const targetBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
        console.log(targetBranch);
    }
}

//Revert a Commit
function revert(commitId) {
    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized");
            return;
        }
        const commitPath = path.join(CVS_DIR, "commits", commitId);
        if (!fs.existsSync(commitPath)) {
            console.log("Commit does not exist.");
            return;
        }

        fs.readdirSync(commitPath).forEach(file => {
            if (file !== "message.txt") {
                const content = fs.readFileSync(path.join(commitPath, file), "utf8");
                fs.writeFileSync(file, content);
            }
        });

        console.log(`Reverted to commit ${commitId}.`);
    } catch (err) {
        console.log("No commmit ID");

    }
}

//Rewrite Commit History
function rebase(sourceBranch, targetBranch) {
    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized");
            return;
        }
        const sourcePath = path.join(CVS_DIR, "branches", `${sourceBranch}.json`);
        const targetPath = path.join(CVS_DIR, "branches", `${targetBranch}.json`);

        if (!fs.existsSync(sourcePath) || !fs.existsSync(targetPath)) {
            console.log("One or both branches do not exist.");
            return;
        }

        const sourceCommits = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
        const targetCommits = JSON.parse(fs.readFileSync(targetPath, "utf8"));

        // Apply source commits on top of the target branch
        const rebasedCommits = [...targetCommits, ...sourceCommits];

        fs.writeFileSync(targetPath, JSON.stringify(rebasedCommits, null, 2));
        console.log(`Rebased branch '${sourceBranch}' onto '${targetBranch}'.`);
    } catch (err) {

        console.log("No sourceBranch or targetBarnch ");

    }
}

//interactiveRebase
function interactiveRebase(sourceBranch, targetBranch) {
    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized");
            return;
        }
        const sourcePath = path.join(CVS_DIR, "branches", `${sourceBranch}.json`);
        const targetPath = path.join(CVS_DIR, "branches", `${targetBranch}.json`);

        if (!fs.existsSync(sourcePath) || !fs.existsSync(targetPath)) {
            console.log("One or both branches do not exist.");
            return;
        }

        let sourceCommits = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
        const targetCommits = JSON.parse(fs.readFileSync(targetPath, "utf8"));

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log("Interactive Rebase: Choose an action for each commit.");

        let newCommits = [];

        function processCommit(index) {
            if (index >= sourceCommits.length) {
                // Rebase complete
                fs.writeFileSync(targetPath, JSON.stringify([...targetCommits, ...newCommits], null, 2));
                console.log("Rebase complete!");
                rl.close();
                return;
            }

            let commitId = sourceCommits[index];
            console.log(`Commit ${commitId}`);
            console.log("Options: (p) Pick, (d) Drop, (e) Edit");

            rl.question("Choose an option: ", (answer) => {
                if (answer === "p") {
                    newCommits.push(commitId);
                } else if (answer === "e") {
                    console.log(`Editing commit ${commitId}... (manual process)`);
                    newCommits.push(commitId);
                } else if (answer === "d") {
                    console.log(`Dropped commit ${commitId}`);
                }
                processCommit(index + 1);
            });
        }

        processCommit(0);
    } catch (err) {

        console.log("No sourceBranch or targetBarnch ");

    }
}

//stash
function stash() {
    if (!fs.existsSync(CVS_DIR)) {
        console.log("Repository is not initialized");
        return;
    }
    if (!fs.existsSync(STASH_DIR)) fs.mkdirSync(STASH_DIR);

    const stashId = Date.now().toString();
    const stashPath = path.join(STASH_DIR, stashId);
    fs.mkdirSync(stashPath);

    fs.readdirSync(process.cwd()).forEach(file => {
        if (file !== CVS_DIR) {
            const content = fs.readFileSync(file, "utf8");
            fs.writeFileSync(path.join(stashPath, file), content);
        }
    });

    console.log(`Changes stashed with ID: ${stashId}`);
}

//stash pop
function stashPop() {
    if (!fs.existsSync(CVS_DIR)) {
        console.log("Repository is not initialized");
        return;
    }
    const stashes = fs.readdirSync(STASH_DIR);
    if (stashes.length === 0) {
        console.log("No stashed changes to apply.");
        return;
    }

    const latestStash = stashes.sort().pop();
    const stashPath = path.join(STASH_DIR, latestStash);

    fs.readdirSync(stashPath).forEach(file => {
        const content = fs.readFileSync(path.join(stashPath, file), "utf8");
        fs.writeFileSync(file, content);
    });

    fs.rmSync(stashPath, { recursive: true, force: true });
    console.log(`Applied stashed changes from ID: ${latestStash}`);
}

// Command-line handling
const args = process.argv.slice(2);
switch (args[0]) {
    case "init":
        initRepo();
        break;
    case "add":
        addFile(...args.slice(1));
        break;
    case "commit":
        commit(args.slice(1).join(" "));
        break;
    case "log":
        logCommits();
        break;
    case "checkout":
        checkout(args[1]);
        break;
    case "branch":
        createBranch(args[1]);
        break;
    case "switchBranch":
        switchBranch(args[1]);
        break;
    case "merge":
        mergeBranch(args[1]);
        break;
    case "push":
        push(args[1]);
        break;
    case "clone":
        clone(args[1]);
        break;
    case "status":
        status();
        break;
    case "revert":
        revert(args[1]);
        break;
    case "rebase":
        rebase(args[1], args[2]);
        break;
    case "rebase-interactive":
        interactiveRebase(args[1], args[2]);
        break;
    case "stash":
        stash();
        break;
    case "stash-pop":
        stashPop();
        break;
    default:
        console.log("Commands: init, add <file>, commit <message>, log, checkout <commitId>");
}
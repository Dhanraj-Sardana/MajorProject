const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline");
const { log } = require("console");
const {initRepo}=require("./commands/init");
const {addFile}=require("./commands/add");
const {commit}=require("./commands/commit");
const {logCommits}=require("./commands/log");
const {checkout}=require("./commands/checkout");
const {createBranch}=require("./commands/branch");
const {switchBranch}=require("./commands/switchBranch");
const {mergeBranch}=require("./commands/merge");
const {push}=require("./commands/push");
const {clone}=require("./commands/clone");
const {pull}=require("./commands/pull");
const {fetch}=require("./commands/fetch");
const {status}=require("./commands/status");
const {revert}=require("./commands/revert");
const {rebase}=require("./commands/rebase");
const {stash}=require("./commands/stash");
const {stashPop}=require("./commands/stashpop");


const CVS_DIR = ".mycvs";

const STASH_DIR = path.join(CVS_DIR, "stash");
// Initialize a repository
// function initRepo() {
//     if (!fs.existsSync(CVS_DIR)) {
//         fs.mkdirSync(CVS_DIR);
//         fs.mkdirSync(path.join(CVS_DIR, "commits"));
//         fs.mkdirSync(path.join(CVS_DIR, "branches"));
//         fs.writeFileSync(path.join(CVS_DIR, "HEAD"), "main"); // Default branch
//         fs.writeFileSync(path.join(CVS_DIR, "branches", "main.json"), JSON.stringify([], null, 2));
//         //fs.writeFileSync(INDEX_FILE, JSON.stringify({}, null, 2));
//         console.log("Initialized an empty repository with 'main' branch.");
//     } else {
//         console.log("Repository already exists.");
//     }
// }


// Stage a file
// function addFile(...filenames) {
//     try {
//         if (!fs.existsSync(CVS_DIR)) {
//             console.log("Repository is not initialized");
//             return;
//         }

//         const targetBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
//         const branchPath = path.join(CVS_DIR, "branches", `${targetBranch}.json`);

//         // Read existing staged files
//         let index = {};
//         if (fs.existsSync(branchPath)) {
//             index = JSON.parse(fs.readFileSync(branchPath, "utf8"));
//         }

//         filenames.forEach(filename => {
//             if (fs.existsSync(filename)) {
//                 const content = fs.readFileSync(filename, "utf8");
//                 index = { [filename]: content };
//                 console.log(`Staged ${filename}.`);
//             } else {
//                 console.log(`File '${filename}' does not exist.`);
//             }
//         });

//         // Update the staging area
//         fs.writeFileSync(branchPath, JSON.stringify(index, null, 2));
//     } catch (err) {
//         console.log("Error adding files:", err);
//     }
// }



// Commit staged files
// function commit(message) {
//     try {
//         if (!fs.existsSync(CVS_DIR)) {
//             console.log("Repository is not initialized");
//             return;
//         }

//         const targetBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
//         const branchPath = path.join(CVS_DIR, "branches", `${targetBranch}.json`);
//         const commitHistoryPath = path.join(CVS_DIR, "branches", `${targetBranch}-history.json`);

//         if (!fs.existsSync(branchPath)) {
//             console.log("Branch does not exist.");
//             return;
//         }

//         const index = JSON.parse(fs.readFileSync(branchPath, "utf8"));

//         if (Object.keys(index).length === 0) {
//             console.log("No changes to commit.");
//             return;
//         }

//         const commitHash = crypto.createHash("sha1").update(Date.now().toString()).digest("hex").slice(0, 7);
//         const commitDir = path.join(CVS_DIR, "commits", commitHash);

//         //Store commit history separately**
//         let commitHistory = [];
//         try {
//             if (fs.existsSync(commitHistoryPath)) {
//                 commitHistory = JSON.parse(fs.readFileSync(commitHistoryPath, "utf8"));
//             }
//         } catch (err) {
//             commitHistory = [];
//         }

//         commitHistory.push(commitHash);
//         fs.writeFileSync(commitHistoryPath, JSON.stringify(commitHistory, null, 2));

//         // Create commit directory
//         fs.mkdirSync(commitDir);

//         // Save files in the commit directory
//         Object.entries(index).forEach(([file, content]) => {
//             fs.writeFileSync(path.join(commitDir, file), content);
//         });

//         // Save commit message
//         fs.writeFileSync(path.join(commitDir, "message.txt"), message);

//         // 🛠 **Fix: Do not erase commit history, just clear staging**
//         fs.writeFileSync(branchPath, JSON.stringify({}, null, 2));

//         console.log(`Committed with ID ${commitHash}.`);
//     } catch (err) {
//         console.log("Error in commiting :", err.message);
//     }
// }

// View commit history
// function logCommits() {
//     if (!fs.existsSync(CVS_DIR)) {
//         console.log("Repository is not initialized");
//         return;
//     }

//     const branchName = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
//     const commitHistoryPath = path.join(CVS_DIR, "branches", `${branchName}-history.json`);

//     if (!fs.existsSync(commitHistoryPath)) {
//         console.log("No commits found.");
//         return;
//     }

//     const commits = JSON.parse(fs.readFileSync(commitHistoryPath, "utf8"));

//     if (!Array.isArray(commits) || commits.length === 0) {
//         console.log("No commits found.");
//         return;
//     }

//     const commitsDir = path.join(CVS_DIR, "commits");

//     commits.forEach(commit => {
//         const messagePath = path.join(commitsDir, commit, "message.txt");
//         if (fs.existsSync(messagePath)) {
//             const message = fs.readFileSync(messagePath, "utf8");
//             console.log(`Commit ${commit}: ${message}`);
//         } else {
//             console.log(`Commit ${commit}: (No message found)`);
//         }
//     });
// }


// Restore a commit
// function checkout(commitId) {

//     try {
//         if (!fs.existsSync(CVS_DIR)) {
//             console.log("Repository is not initialized");
//             return;
//         }
//         const commitPath = path.join(CVS_DIR, "commits", commitId);
//         if (!fs.existsSync(commitPath)) {
//             console.log("Commit does not exist.");
//             return;
//         }

//         fs.readdirSync(commitPath).forEach(file => {
//             if (file !== "message.txt") {
//                 const content = fs.readFileSync(path.join(commitPath, file), "utf8");
//                 fs.writeFileSync(file, content);
//             }
//         });

//         console.log(`Checked out commit ${commitId}.`);
//     } catch (err) {
//         console.log("Error in restoring a commit :", err.message);
//     }
// }
//create branch
// function createBranch(branchName) {
//     try {
//         if (!fs.existsSync(CVS_DIR)) {
//             console.log("Repository is not initialized.");
//             return;
//         }

//         const branchPath = path.join(CVS_DIR, "branches", `${branchName}.json`);
//         if (fs.existsSync(branchPath)) {
//             console.log("Branch already exists.");
//             return;
//         }

//         const currentBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
//         const currentHistoryPath = path.join(CVS_DIR, "branches", `${currentBranch}-history.json`);
//         const newHistoryPath = path.join(CVS_DIR, "branches", `${branchName}-history.json`);

//         let latestCommit = null;
//         if (fs.existsSync(currentHistoryPath)) {
//             const history = JSON.parse(fs.readFileSync(currentHistoryPath, "utf8"));
//             if (history.length > 0) {
//                 latestCommit = history[history.length - 1];
//             }
//         }

//         fs.writeFileSync(branchPath, JSON.stringify([], null, 2));
//         fs.writeFileSync(newHistoryPath, JSON.stringify(latestCommit ? [latestCommit] : [], null, 2));

//         console.log(`Branch '${branchName}' created.`);
//         if (latestCommit) {
//             console.log(`Copied latest commit '${latestCommit}' from '${currentBranch}' branch.`);
//         }
//     } catch (err) {
//         console.log("Error creating branch:", err.message);
//     }
// }


//Switch to a Branch
// function switchBranch(branchName) {
//     try {
//         if (!fs.existsSync(CVS_DIR)) {
//             console.log("Repository is not initialized");
//             return;
//         }

//         const branchPath = path.join(CVS_DIR, "branches", `${branchName}.json`);
//         if (!fs.existsSync(branchPath)) {
//             console.log("Branch does not exist.");
//             return;
//         }

//         // Get current branch name
//         const currentBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();

//         // Save current state before switching (if there's an active branch)
//         if (currentBranch) {
//             const currentFiles = fs.readdirSync(".").filter(file => (
//                 !file.startsWith(".") && fs.lstatSync(file).isFile() && file !== "cvs.js"
//             ));

//             // Save current working directory state in a separate file
//             fs.writeFileSync(path.join(CVS_DIR, "branches", `${currentBranch}-state.json`), JSON.stringify(currentFiles, null, 2));
//         }

//         // Clear current working directory (excluding CVS system files & `cvs.js`)
//         fs.readdirSync(".").forEach(file => {
//             if (!file.startsWith(".") && fs.lstatSync(file).isFile() && file !== "cvs.js") {
//                 fs.unlinkSync(file);
//             }
//         });

//         // Update HEAD to new branch
//         fs.writeFileSync(path.join(CVS_DIR, "HEAD"), branchName);
//         console.log(`Switched to branch '${branchName}'.`);

//         // Restore last saved state (if any)
//         const savedStatePath = path.join(CVS_DIR, "branches", `${branchName}-state.json`);
//         if (fs.existsSync(savedStatePath)) {
//             const savedFiles = JSON.parse(fs.readFileSync(savedStatePath, "utf8"));
//             savedFiles.forEach(file => {
//                 const latestCommitPath = path.join(CVS_DIR, "commits");
//                 const commitHistoryPath = path.join(CVS_DIR, "branches", `${branchName}-history.json`);

//                 if (fs.existsSync(commitHistoryPath)) {
//                     const commitHistory = JSON.parse(fs.readFileSync(commitHistoryPath, "utf8"));
//                     if (commitHistory.length > 0) {
//                         const latestCommit = commitHistory[commitHistory.length - 1];
//                         const filePath = path.join(latestCommitPath, latestCommit, file);

//                         if (fs.existsSync(filePath)) {
//                             const content = fs.readFileSync(filePath, "utf8");
//                             fs.writeFileSync(file, content);
//                         }
//                     }
//                 }
//             });
//         }

//     } catch (err) {
//         console.log("Error in switching branch:", err.message);
//     }
// }

//Merging Branches
// const mergeBranch = (sourceBranch) => {
//     try {
//         if (!fs.existsSync(CVS_DIR)) {
//             console.log("Repository is not initialized");
//             return;
//         }

//         const targetBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();

//         if (sourceBranch === targetBranch) {
//             console.log("Source and target branches are the same.");
//             return;
//         }

//         const sourceHistoryPath = path.join(CVS_DIR, "branches", `${sourceBranch}-history.json`);
//         const targetHistoryPath = path.join(CVS_DIR, "branches", `${targetBranch}-history.json`);
//         const sourceStatePath = path.join(CVS_DIR, "branches", `${sourceBranch}-state.json`);
//         const targetStatePath = path.join(CVS_DIR, "branches", `${targetBranch}-state.json`);

//         if (!fs.existsSync(sourceHistoryPath) || !fs.existsSync(targetHistoryPath)) {
//             console.log("One or both branches do not have commit history.");
//             return;
//         }

//         const sourceHistory = JSON.parse(fs.readFileSync(sourceHistoryPath, "utf8"));
//         const targetHistory = JSON.parse(fs.readFileSync(targetHistoryPath, "utf8"));
//         const sourceState = fs.existsSync(sourceStatePath) ? JSON.parse(fs.readFileSync(sourceStatePath, "utf8")) : [];
//         const targetState = fs.existsSync(targetStatePath) ? JSON.parse(fs.readFileSync(targetStatePath, "utf8")) : [];

//         if (sourceHistory.length === 0 || targetHistory.length === 0) {
//             console.log("One or both branches have no commits to merge.");
//             return;
//         }

//         const latestSourceCommit = sourceHistory[sourceHistory.length - 1];
//         const latestTargetCommit = targetHistory[targetHistory.length - 1];

//         const sourceCommitPath = path.join(CVS_DIR, "commits", latestSourceCommit);
//         const targetCommitPath = path.join(CVS_DIR, "commits", latestTargetCommit);

//         let mergedFiles = {};
//         let conflicts = [];


//         // Process source branch files
//         sourceState.forEach(file => {
//             const sourceFilePath = path.join(sourceCommitPath, file);
//             const targetFilePath = path.join(targetCommitPath, file);

//             if (fs.existsSync(sourceFilePath)) {
//                 const sourceContent = fs.readFileSync(sourceFilePath, "utf8");

//                 if (fs.existsSync(targetFilePath)) {
//                     const targetContent = fs.readFileSync(targetFilePath, "utf8");

//                     if (sourceContent !== targetContent) {
//                         // Conflict detected
//                         const conflictFile = `${file}.conflict`;
//                         fs.writeFileSync(conflictFile, `<<<<<<< ${sourceBranch}\n${sourceContent}\n=======\n${targetContent}\n>>>>>>> ${targetBranch}`);
//                         conflicts.push(file);
//                     } else {
//                         mergedFiles[file] = sourceContent;
//                     }
//                 } else {
//                     mergedFiles[file] = sourceContent;
//                 }
//             }
//         });

//         // Add unique files from the target branch
//         targetState.forEach(file => {
//             if (!mergedFiles[file] && fs.existsSync(path.join(targetCommitPath, file))) {
//                 mergedFiles[file] = fs.readFileSync(path.join(targetCommitPath, file), "utf8");
//             }
//         });

//         // Save merged files if no conflicts
//         if (conflicts.length === 0) {
//             const newCommitHash = crypto.createHash("sha1").update(Date.now().toString()).digest("hex").slice(0, 7);
//             const newCommitDir = path.join(CVS_DIR, "commits", newCommitHash);

//             fs.mkdirSync(newCommitDir);
//             Object.entries(mergedFiles).forEach(([file, content]) => {
//                 fs.writeFileSync(path.join(newCommitDir, file), content);
//                 fs.writeFileSync(path.join(newCommitDir, "message.txt"), `Branch '${sourceBranch}' successfully merged into '${targetBranch}'.`);
//             });

//             // Update history and state for the target branch
//             targetHistory.push(newCommitHash);
//             fs.writeFileSync(targetHistoryPath, JSON.stringify(targetHistory, null, 2));
//             fs.writeFileSync(targetStatePath, JSON.stringify(Object.keys(mergedFiles), null, 2));

//             console.log(`Branch '${sourceBranch}' successfully merged into '${targetBranch}'.`);
//             //....... delete conflict file here
//             fs.readdirSync(".").forEach(file => {
//                 if (file.endsWith(".conflict")) {
//                     fs.unlinkSync(file); // Delete conflict file
//                 }
//             });
//         } else {
//             console.log("Merge completed with conflicts in:", conflicts);
//             console.log("Resolve the conflicts manually in .conflict files.");
//         }
//     } catch (err) {
//         console.error("Error merging branches:", err);
//     }
// };

//push
// function push(remotePath) {
//     try {
//         if (!fs.existsSync(CVS_DIR)) {
//             console.log("Repository is not initialized");
//             return;
//         }
//         if (!fs.existsSync(remotePath)) {
//             console.log("Remote repository does not exist.");
//             return;
//         }


//         fs.cpSync(CVS_DIR, path.join(remotePath, CVS_DIR), { recursive: true });
//         console.log("Pushed changes to remote repository.");
//     } catch (err) {
//         console.log("Error pushing:", err.message);
//     }
// }
//Clone
// function clone(remotePath) {
//     try {
//         if (!fs.existsSync(remotePath)) {
//             console.log("Remote repository does not exist.");
//             return;
//         }

//         if (!fs.existsSync(CVS_DIR)) {
//             fs.mkdirSync(CVS_DIR);
//         }

//         // Copy .mycvs directory
//         fs.cpSync(path.join(remotePath, CVS_DIR), CVS_DIR, { recursive: true });
//         console.log("Cloned the .mycvs folder.");

//         // Identify the current branch
//         const headFilePath = path.join(CVS_DIR, "HEAD");
//         if (!fs.existsSync(headFilePath)) {
//             console.log("HEAD file not found. Cloning without branch-specific files.");
//             return;
//         }

//         const currentBranch = fs.readFileSync(headFilePath, "utf-8").trim();
//         console.log(`Current branch: ${currentBranch}`);

//         // Find the latest commit hash for the current branch
//         const branchHistoryPath = path.join(CVS_DIR, "branches", `${currentBranch}-history.json`);
//         if (!fs.existsSync(branchHistoryPath)) {
//             console.log(`No commit history found for branch: ${currentBranch}`);
//             return;
//         }

//         const branchHistory = JSON.parse(fs.readFileSync(branchHistoryPath, "utf-8"));
//         if (branchHistory.length === 0) {
//             console.log(`Branch ${currentBranch} has no commits.`);
//             return;
//         }

//         const latestCommitHash = branchHistory[branchHistory.length - 1]; // Get the latest commit
//         console.log(`Latest commit hash: ${latestCommitHash}`);

//         // Copy files from the latest commit OUTSIDE of .mycvs
//         const remoteCommitPath = path.join(remotePath, CVS_DIR, "commits", latestCommitHash);
//         let conflicts = [];

//         if (fs.existsSync(remoteCommitPath)) {
//             for (const file of fs.readdirSync(remoteCommitPath)) {
//                 if (file === "message.txt") continue;  // Skip commit message file

//                 const destFilePath = path.join(process.cwd(), file); // Place files in working directory
//                 const srcFilePath = path.join(remoteCommitPath, file);

//                 if (fs.existsSync(destFilePath)) {
//                     // Conflict detected, but we don't resolve it
//                     conflicts.push(file);
//                 } else {
//                     fs.copyFileSync(srcFilePath, destFilePath);
//                     console.log(`Copied: ${file}`);
//                 }
//             }

//             console.log("Cloned the latest commit files into the working directory.");
//         } else {
//             console.log("No files found for the latest commit.");
//         }

//         // Display conflict warning
//         if (conflicts.length > 0) {
//             console.log("\n Conflicts detected! The following files already exist in the working directory:");
//             conflicts.forEach(file => console.log(`   - ${file}`));
//             console.log("\nResolve conflicts manually before proceeding.");
//         }

//     } catch (err) {
//         console.log("Error cloning:", err.message);
//     }
// }
//Pull
// function pull(remoteRepoPath) {
//     try {
//         if (!fs.existsSync(CVS_DIR)) {
//             console.log("Repository is not initialized.");
//             return;
//         }

//         if (!fs.existsSync(remoteRepoPath)) {
//             console.log("Remote repository does not exist.");
//             return;
//         }

//         console.log("Fetching updates from remote repository...");
//         fetch(remoteRepoPath);

//         console.log("Merging fetched changes into the working directory...");

//         const localRemoteDir = path.join(CVS_DIR, "remote");
//         const localCommitsPath = path.join(localRemoteDir, "commits");
//         const localBranchesPath = path.join(localRemoteDir, "branches");

//         const localCommitsDest = path.join(CVS_DIR, "commits");
//         const localBranchesDest = path.join(CVS_DIR, "branches");

//         // Merge fetched commits
//         if (fs.existsSync(localCommitsPath)) {
//             fs.readdirSync(localCommitsPath).forEach(commitHash => {
//                 const fetchedCommitPath = path.join(localCommitsPath, commitHash);
//                 const localCommitPath = path.join(localCommitsDest, commitHash);

//                 if (!fs.existsSync(localCommitPath)) {
//                     fs.mkdirSync(localCommitPath, { recursive: true });

//                     fs.readdirSync(fetchedCommitPath).forEach(file => {
//                         fs.copyFileSync(
//                             path.join(fetchedCommitPath, file),
//                             path.join(localCommitPath, file)
//                         );
//                     });
//                 }
//             });
//         }

//         // Merge fetched branches
//         if (fs.existsSync(localBranchesPath)) {
//             fs.readdirSync(localBranchesPath).forEach(branchFile => {
//                 const fetchedBranchFilePath = path.join(localBranchesPath, branchFile);
//                 const localBranchFilePath = path.join(localBranchesDest, branchFile);

//                 fs.copyFileSync(fetchedBranchFilePath, localBranchFilePath);
//             });
//         }

//         console.log("Pull successful. Latest changes merged into the local repository.");
//     } catch (err) {
//         console.error("Error pulling from remote repository:", err.message);
//     }
// }

//fetch
// function fetch(remoteRepoPath) {
//     try {
//         if (!fs.existsSync(CVS_DIR)) {
//             console.log("Repository is not initialized.");
//             return;
//         }

//         if (!fs.existsSync(remoteRepoPath)) {
//             console.log("Remote repository does not exist.");
//             return;
//         }

//         const remoteBranchesPath = path.join(remoteRepoPath, "branches");
//         const remoteCommitsPath = path.join(remoteRepoPath, "commits");
//         const localRemoteDir = path.join(CVS_DIR, "remote");
//         const localCommitsPath = path.join(localRemoteDir, "commits");

//         // Ensure the "remote" directory exists
//         if (!fs.existsSync(localRemoteDir)) {
//             fs.mkdirSync(localRemoteDir, { recursive: true });
//         }

//         // Fetch branches
//         if (fs.existsSync(remoteBranchesPath)) {
//             fs.readdirSync(remoteBranchesPath).forEach(branchFile => {
//                 const remoteBranchFilePath = path.join(remoteBranchesPath, branchFile);
//                 const localBranchFilePath = path.join(localRemoteDir, branchFile);

//                 fs.copyFileSync(remoteBranchFilePath, localBranchFilePath);
//             });
//         }

//         // Fetch new commits only
//         if (!fs.existsSync(localCommitsPath)) {
//             fs.mkdirSync(localCommitsPath, { recursive: true });
//         }

//         if (fs.existsSync(remoteCommitsPath)) {
//             fs.readdirSync(remoteCommitsPath).forEach(commitHash => {
//                 const remoteCommitPath = path.join(remoteCommitsPath, commitHash);
//                 const localCommitPath = path.join(localCommitsPath, commitHash);

//                 if (!fs.existsSync(localCommitPath)) {
//                     fs.mkdirSync(localCommitPath, { recursive: true });

//                     fs.readdirSync(remoteCommitPath).forEach(file => {
//                         fs.copyFileSync(
//                             path.join(remoteCommitPath, file),
//                             path.join(localCommitPath, file)
//                         );
//                     });
//                 }
//             });
//         }

//         console.log("Fetch successful. Updates are stored in the 'remote' directory.");
//     } catch (err) {
//         console.error("Error fetching from remote repository:", err.message);
//     }
// }


//current branch
// function status() {

//     if (!fs.existsSync(CVS_DIR)) {
//         console.log("No Repository  exists! so can not tell about branch");
//     } else {
//         const targetBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
//         console.log(targetBranch);
//     }
// }

//Revert a Commit
// function revert(commitId) {
//     try {
//         if (!fs.existsSync(CVS_DIR)) {
//             console.log("Repository is not initialized");
//             return;
//         }
//         const commitPath = path.join(CVS_DIR, "commits", commitId);
//         if (!fs.existsSync(commitPath)) {
//             console.log("Commit does not exist.");
//             return;
//         }

//         fs.readdirSync(commitPath).forEach(file => {
//             if (file !== "message.txt") {
//                 const content = fs.readFileSync(path.join(commitPath, file), "utf8");
//                 fs.writeFileSync(file, content);
//             }
//         });

//         console.log(`Reverted to commit ${commitId}.`);
//     } catch (err) {
//         console.log("Error in revert:", err.message);
//     }
// }
//Rewrite Commit History

// function generateCommitHash() {
//     return crypto.randomBytes(6).toString("hex");
// }

// function rebase(targetBranch) {
//     const BRANCHES_DIR = path.join(CVS_DIR, "branches");
// const COMMITS_DIR = path.join(CVS_DIR, "commits");
// const HEAD_FILE = path.join(CVS_DIR, "HEAD");

//     try {
//         if (!fs.existsSync(CVS_DIR)) {
//             console.log("Repository is not initialized.");
//             return;
//         }

//         if (!fs.existsSync(HEAD_FILE)) {
//             console.log("HEAD file not found. Unable to rebase.");
//             return;
//         }

//         const currentBranch = fs.readFileSync(HEAD_FILE, "utf-8").trim();
//         if (currentBranch === targetBranch) {
//             console.log("Already on the target branch. No rebase needed.");
//             return;
//         }

//         const targetHistoryPath = path.join(BRANCHES_DIR, `${targetBranch}-history.json`);
//         const sourceHistoryPath = path.join(BRANCHES_DIR, `${currentBranch}-history.json`);

//         if (!fs.existsSync(targetHistoryPath) || !fs.existsSync(sourceHistoryPath)) {
//             console.log("One of the branch histories is missing.");
//             return;
//         }

//         const targetHistory = JSON.parse(fs.readFileSync(targetHistoryPath, "utf-8"));
//         const sourceHistory = JSON.parse(fs.readFileSync(sourceHistoryPath, "utf-8`"));

//         // Find common ancestor
//         let commonAncestorIndex = -1;
//         for (let i = sourceHistory.length - 1; i >= 0; i--) {
//             if (targetHistory.includes(sourceHistory[i])) {
//                 commonAncestorIndex = i;
//                 break;
//             }
//         }

//         if (commonAncestorIndex === -1) {
//             console.log("No common ancestor found. Unable to rebase.");
//             return;
//         }

//         const newCommits = sourceHistory.slice(commonAncestorIndex + 1);
//         if (newCommits.length === 0) {
//             console.log("No new commits to rebase.");
//             return;
//         }

//         console.log(`ebasing ${newCommits.length} commits from '${currentBranch}' onto '${targetBranch}'...`);

//         let rebasedCommits = [];
//         let conflictsDetected = false;

//         for (const oldCommit of newCommits) {
//             console.log(`Applying commit: ${oldCommit}`);

//             const oldCommitPath = path.join(COMMITS_DIR, oldCommit);
//             if (!fs.existsSync(oldCommitPath)) {
//                 console.log(`Commit ${oldCommit} not found. Skipping.`);
//                 continue;
//             }

//             const newCommitHash = generateCommitHash();
//             const newCommitPath = path.join(COMMITS_DIR, newCommitHash);
//             fs.mkdirSync(newCommitPath, { recursive: true });

//             fs.readdirSync(oldCommitPath).forEach(file => {
//                 if (file === "message.txt") return;

//                 const sourceFilePath = path.join(oldCommitPath, file);
//                 const destFilePath = path.join(newCommitPath, file);
//                 const workingFilePath = path.join(process.cwd(), file);

//                 const sourceContent = fs.readFileSync(sourceFilePath, "utf-8");
//                 let targetContent = "";

//                 if (fs.existsSync(workingFilePath)) {
//                     targetContent = fs.readFileSync(workingFilePath, "utf-8");

//                     if (sourceContent !== targetContent) {
//                         // Conflict detected
//                         conflictsDetected = true;
//                         console.log(`Conflict detected in file: ${file}`);

//                         const conflictContent =
//                             `<<<<<<< current version (${targetBranch})\n` +
//                             `${targetContent}\n=======\n${sourceContent}\n>>>>>>> rebased commit\n`;

//                         fs.writeFileSync(workingFilePath, conflictContent, "utf-8");
//                         fs.writeFileSync(destFilePath, conflictContent, "utf-8");

//                         console.log(`Manual resolution needed in file: ${file}`);
//                         return;
//                     }
//                 }

//                 // No conflict
//                 fs.copyFileSync(sourceFilePath, destFilePath);
//                 fs.copyFileSync(sourceFilePath, workingFilePath);
//             });

//             // Preserve commit message
//             const messageFile = path.join(oldCommitPath, "message.txt");
//             if (fs.existsSync(messageFile)) {
//                 fs.copyFileSync(messageFile, path.join(newCommitPath, "message.txt"));
//             }

//             rebasedCommits.push(newCommitHash);
//         }

//         if (conflictsDetected) {
//             console.log("Rebase paused due to conflicts. Please resolve them manually and rerun the rebase.");
//             return;
//         }

//         // Update target branch history and HEAD
//         const updatedHistory = [...targetHistory, ...rebasedCommits];
//         fs.writeFileSync(targetHistoryPath, JSON.stringify(updatedHistory, null, 2));
//         fs.writeFileSync(HEAD_FILE, targetBranch);
//         console.log("Rebase completed successfully.");
//     } catch (err) {
//         console.log("Error in rebase:", err.message);
//     }
// }

//stash
// function stash() {
//     if (!fs.existsSync(CVS_DIR)) {
//         console.log("Repository is not initialized");
//         return;
//     }
//     if (!fs.existsSync(STASH_DIR)) fs.mkdirSync(STASH_DIR);

//     const stashId = Date.now().toString();
//     const stashPath = path.join(STASH_DIR, stashId);
//     fs.mkdirSync(stashPath);

//     fs.readdirSync(process.cwd()).forEach(file => {
//         if (file !== CVS_DIR) {
//             const content = fs.readFileSync(file, "utf8");
//             fs.writeFileSync(path.join(stashPath, file), content);
//         }
//     });

//     console.log(`Changes stashed with ID: ${stashId}`);
// }

//stash pop
// function stashPop() {
//     if (!fs.existsSync(CVS_DIR)) {
//         console.log("Repository is not initialized");
//         return;
//     }
//     const stashes = fs.readdirSync(STASH_DIR);
//     if (stashes.length === 0) {
//         console.log("No stashed changes to apply.");
//         return;
//     }

//     const latestStash = stashes.sort().pop();
//     const stashPath = path.join(STASH_DIR, latestStash);

//     fs.readdirSync(stashPath).forEach(file => {
//         const content = fs.readFileSync(path.join(stashPath, file), "utf8");
//         fs.writeFileSync(file, content);
//     });

//     fs.rmSync(stashPath, { recursive: true, force: true });
//     console.log(`Applied stashed changes from ID: ${latestStash}`);
// }

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
    case "pull":
        pull(args[1]);
        break;
    case "fetch":
        fetch(args[1]);
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
        rebase(args[1]);
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
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
function addFile(filename) {
    try{
    if (!fs.existsSync(CVS_DIR)) {
        console.log("Repository is not initialized");
        return;
    }

    if (!fs.existsSync(filename)) {
        console.log("File does not exist.");
        return;
    }
    

    const content = fs.readFileSync(filename, "utf8");
    //add in current branch
    const targetBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
    const branchPath = path.join(CVS_DIR, "branches", `${targetBranch}.json`);
    const index = JSON.parse(fs.readFileSync(branchPath, "utf8"));
    index[filename] = content;
    //.........
    
    
    
    fs.writeFileSync(branchPath,"yo");
    
    //..............
    fs.writeFileSync(branchPath, JSON.stringify(index, null, 2));
    console.log(`Staged ${filename}.`);
    }catch(err){
console.log("No Filename");

    }
}

// Commit staged files
function commit(message) {
    try{
    if (!fs.existsSync(CVS_DIR)) {
        console.log("Repository is not initialized");
        return;
    }
    const targetBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
    const branchPath = path.join(CVS_DIR, "branches", `${targetBranch}.json`);
    const index = JSON.parse(fs.readFileSync(branchPath, "utf8"));
    if (Object.keys(index).length === 0) {
        console.log("No changes to commit.");
        return;
    }

    const commitHash = crypto.createHash("sha1").update(Date.now().toString()).digest("hex").slice(0, 7);
    
    const commitDir = path.join(CVS_DIR, "commits", commitHash);

    if (!fs.existsSync(branchPath)) {
        console.log("Branch does not exist.");
        return;
    }

    // Add commit to the branch history
    const branchCommits = JSON.parse(fs.readFileSync(branchPath, "utf8"));
    branchCommits.push(commitHash);
    fs.writeFileSync(branchPath, JSON.stringify(branchCommits, null, 2));

    fs.mkdirSync(commitDir);

    Object.entries(index).forEach(([file, content]) => {
        fs.writeFileSync(path.join(commitDir, file), content);
    });

    fs.writeFileSync(path.join(commitDir, "message.txt"), message);
    fs.writeFileSync(branchPath, JSON.stringify({}, null, 2));

    console.log(`Committed with ID ${commitHash}.`);
    }catch(err){
        console.log("No message");
        
            }
}

// View commit history
function logCommits() {
    if (!fs.existsSync(CVS_DIR)) {
        console.log("Repository is not initialized");
        return;
    }
    const branchName = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
    const branchPath = path.join(CVS_DIR, "branches", `${branchName}.json`);
    if (!fs.existsSync(branchPath)) {
        console.log("Branch does not exist.");
        return;
    }

    const commits = JSON.parse(fs.readFileSync(branchPath, "utf8"));


    if (commits.length === 0) {
        console.log("No commits found.");
        return;
    }

    commits.forEach(commit => {
        const message = fs.readFileSync(path.join(commitsDir, commit, "message.txt"), "utf8");
        console.log(`Commit ${commit}: ${message}`);
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
    }catch(err) {
        if(!commitId){
            console.log("No commit id");
         
        }
    }
}
//create branch
function createBranch(branchName) {
    try{
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
    }catch(ERR){
        console.log("NO Branchname");
        
    }
}

//Switch to a Branch
function switchBranch(branchName) {
    try{
    if (!fs.existsSync(CVS_DIR)) {
        console.log("Repository is not initialized");
        return;
    }
    const branchPath = path.join(CVS_DIR, "branches", `${branchName}.json`);
    if (!fs.existsSync(branchPath)) {
        console.log("Branch does not exist.");
        return;
    }

    fs.writeFileSync(path.join(CVS_DIR, "HEAD"), branchName);
    console.log(`Switched to branch '${branchName}'.`);
    }catch(err){
        console.log("No Branchname");
        
            }
}
//Merging Branches
function mergeBranch(sourceBranch) {
    try{
    if (!fs.existsSync(CVS_DIR)) {
        console.log("Repository is not initialized");
        return;
    }
    const targetBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
    if (sourceBranch === targetBranch) {
        console.log("Cannot merge a branch into itself.");
        return;
    }

    const sourcePath = path.join(CVS_DIR, "branches", `${sourceBranch}.json`);
    const targetPath = path.join(CVS_DIR, "branches", `${targetBranch}.json`);

    if (!fs.existsSync(sourcePath)) {
        console.log("Source branch does not exist.");
        return;
    }

    const sourceCommits = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
    let targetCommits = JSON.parse(fs.readFileSync(targetPath, "utf8"));

    targetCommits = [...targetCommits, ...sourceCommits]; // Merge commits

    fs.writeFileSync(targetPath, JSON.stringify(targetCommits, null, 2));
    console.log(`Merged branch '${sourceBranch}' into '${targetBranch}'.`);
    }catch(err){
        console.log("No Sourcebranch");
        
    }
}

//push
function push(remotePath) {
    try{
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
    }catch(err){
        console.log("No RemotePath");
        
    }
}
//pull
function pull(remotePath) {
    try{
    if (!fs.existsSync(CVS_DIR)) {
        console.log("Repository is not initialized");
        return;
    }
    if (!fs.existsSync(remotePath)) {
        console.log("Remote repository does not exist.");
        return;
    }

    fs.cpSync(remotePath, CVS_DIR, { recursive: true });
    console.log("Pulled changes from remote repository.");
    }
    catch(err){
        console.log("No RemotePath");
        
    }
}

//current branch
function status(){
   
    if (!fs.existsSync(CVS_DIR)){
        console.log("No Repository  exists! so can not tell about branch");
    } else{
        const targetBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();
        console.log(targetBranch);
    }
}

//Revert a Commit
function revert(commitId) {
    try{
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
    }catch(err){
        console.log("No commmit ID");
        
    }
}

//Rewrite Commit History
function rebase(sourceBranch, targetBranch) {
    try{
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
    }catch(err){
        
        console.log("No sourceBranch or targetBarnch ");
        
    }
}

//interactiveRebase
function interactiveRebase(sourceBranch, targetBranch) {
    try{
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
    }catch(err){
        
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
        addFile(args[1]);
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
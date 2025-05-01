const {initRepo}=require("./commands/init");
const {addFile}=require("./commands/add");
const {commit}=require("./commands/commit");
const {logCommits}=require("./commands/log");
const {checkout}=require("./commands/checkout");
const {createBranch}=require("./commands/branch");
const {switchBranch}=require("./commands/switchBranch");
const {mergeBranch}=require("./commands/merge");
const { pushToServer } = require("./commands/pushToServer");
const {clone}=require("./commands/clone");
const {pull}=require("./commands/pull");
const {fetch}=require("./commands/fetch");
const {status}=require("./commands/status");
const {rebase}=require("./commands/rebase");
const {stash}=require("./commands/stash");
const {stashPop}=require("./commands/stashpop");


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
        pushToServer(args[1],args[2]);
        break;
    case "pull":
        pull(args[1],args[2]);
        break;
    case "fetch":
        fetch(args[1],args[2]);
        break;
    case "clone":
        clone(args[1],args[2]);
        break;
    case "status":
        status();
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
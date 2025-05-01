const fs = require("fs");
const path = require("path");
const CVS_DIR = "../../CVS/mycvs";
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
module.exports={initRepo};
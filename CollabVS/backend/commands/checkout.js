const fs = require("fs");
const path = require("path");
const CVS_DIR = "../../CVS/mycvs";
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
                fs.writeFileSync(path.join("../../CVS",file), content);
            }
        });

        console.log(`Checked out commit ${commitId}.`);
    } catch (err) {
        console.log("Error in restoring a commit :", err.message);
    }
}

module.exports = {checkout};
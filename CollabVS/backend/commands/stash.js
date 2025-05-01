const fs = require("fs");
const path = require("path");
const CVS_DIR = "../../CVS/mycvs";
const STASH_DIR = path.join(CVS_DIR, "stash");
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

module.exports={stash};

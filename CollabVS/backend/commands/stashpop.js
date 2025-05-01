const fs = require("fs");
const path = require("path");
const CVS_DIR = "../../CVS/mycvs";
const STASH_DIR = path.join(CVS_DIR, "stash");
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

module.exports = {stashPop};
const fs = require("fs");
const path = require("path");

const CVS_DIR = path.resolve(__dirname, "../../CVS");
const MYCVS_DIR = path.join(CVS_DIR, "mycvs");
const STASH_DIR = path.join(MYCVS_DIR, "stash");

function stashPop() {
  if (!fs.existsSync(MYCVS_DIR)) {
    console.log("Repository is not initialized");
    return;
  }

  if (!fs.existsSync(STASH_DIR)) {
    console.log("No stash directory found.");
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
    const stashFilePath = path.join(stashPath, file);
    const restorePath = path.join(CVS_DIR, file);

    try {
      const content = fs.readFileSync(stashFilePath, "utf8");
      fs.writeFileSync(restorePath, content);
    } catch (err) {
      console.error(`Failed to restore ${file}:`, err.message);
    }
  });

  fs.rmSync(stashPath, { recursive: true, force: true });
  console.log(`Applied stashed changes from ID: ${latestStash}`);
}

module.exports = { stashPop };

const fs = require("fs");
const path = require("path");

const CVS_DIR = path.resolve(__dirname, "../../CVS");
const MYCVS_DIR = path.join(CVS_DIR, "mycvs");
const STASH_DIR = path.join(MYCVS_DIR, "stash");

function stash() {
  if (!fs.existsSync(MYCVS_DIR)) {
    console.log("Repository is not initialized");
    return;
  }

  if (!fs.existsSync(STASH_DIR)) fs.mkdirSync(STASH_DIR, { recursive: true });

  const stashId = Date.now().toString();
  const stashPath = path.join(STASH_DIR, stashId);
  fs.mkdirSync(stashPath);

  fs.readdirSync(CVS_DIR).forEach(file => {
    const fullPath = path.join(CVS_DIR, file);

    // Skip .mycvs and only stash regular files
    if (file !== 'mycvs' && fs.lstatSync(fullPath).isFile()) {
      try {
        const content = fs.readFileSync(fullPath, "utf8");

        // Write to stash
        fs.writeFileSync(path.join(stashPath, file), content);

        // Delete original file after stashing
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.error(`Failed to stash ${file}:`, err.message);
      }
    }
  });

  console.log(`Changes stashed with Stash ID: ${stashId}`);
}

module.exports = { stash };

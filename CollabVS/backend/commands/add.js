const fs = require("fs");
const path = require("path");
const CVS_DIR = "../../CVS/mycvs";

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
            let filepath=`../../CVS/${filename}`;
            if (fs.existsSync(filepath)){    
                const content = fs.readFileSync(filepath, "utf8");
                index = { [filename]: content };
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

module.exports={addFile};
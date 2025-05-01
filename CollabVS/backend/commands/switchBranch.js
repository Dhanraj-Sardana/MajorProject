const fs = require("fs");
const path = require("path");
const CVS_DIR = "../../CVS/mycvs";

function switchBranch(branchName) {
    try {
        if (!fs.existsSync(CVS_DIR)) {
            console.log("Repository is not initialized");
            return;
        }

        const branchPath = path.join(CVS_DIR, "branches", `${branchName}.json`);
        if (!fs.existsSync(branchPath)) {
            console.log("Branch does not exist.");
            return;
        }

        // Get current branch name
        const currentBranch = fs.readFileSync(path.join(CVS_DIR, "HEAD"), "utf8").trim();

        // Save current state before switching (if there's an active branch)
        if (currentBranch) {
            const currentFiles = fs.readdirSync("../../CVS").filter(file =>
                !file.startsWith(".") &&
                fs.lstatSync(path.join("../../CVS", file)).isFile() &&
                file !== "cvs.js" 
            );

            const stateData = {};
            const commitpath=path.join(CVS_DIR,"commits");
            const commits=fs.readdirSync(commitpath);
            
            const filename = new Set();
            commits.forEach(commit=>{
                const files=fs.readdirSync(path.join(CVS_DIR,"commits",commit));
                files.forEach(file=>{if(file!=='message.txt'){
                    filename.add(file);
            }})
                
            })
           
            // check commit folder 
            currentFiles.forEach(file => {
                
                filename.forEach(File=>{
                    if(file===File){
                    const content = fs.readFileSync(path.join("../../CVS", file), "utf8");
                    stateData[file] = content;
                    }
                })
                
            });

            fs.writeFileSync(
                path.join(CVS_DIR, "branches", `${currentBranch}-state.json`),
                JSON.stringify(stateData, null, 2)
            );
        }

        // Clear current working directory (excluding CVS system files & cvs.js)
        fs.readdirSync("../../CVS").forEach(file => {
            const filePath = path.join("../../CVS", file);
            if (!file.startsWith(".") && fs.lstatSync(filePath).isFile() && file !== "cvs.js") {
                fs.unlinkSync(filePath);
            }
        });

        // Update HEAD to new branch
        fs.writeFileSync(path.join(CVS_DIR, "HEAD"), branchName);
        console.log(`Switched to branch '${branchName}'.`);

        // Restore the saved state (full file content)
        const savedStatePath = path.join(CVS_DIR, "branches", `${branchName}-state.json`);
        if (fs.existsSync(savedStatePath)) {
            const savedFiles = JSON.parse(fs.readFileSync(savedStatePath, "utf8"));
            Object.entries(savedFiles).forEach(([filename, content]) => {
                fs.writeFileSync(path.join("../../CVS", filename), content);
            });
            console.log("Working directory restored from saved state.");
        } else {
            console.log("No saved state found for this branch.");
        }

    } catch (err) {
        console.log("Error in switching branch:", err.message);
    }
}

module.exports = {
    switchBranch,
};

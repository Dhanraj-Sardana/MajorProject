const { fetch } = require("./fetch");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const axios=require("axios");
const { log } = require("console");

const CVS_DIR = path.resolve(__dirname, "../../CVS/mycvs");

async function pull(remoteURL, reponame) {
  try {
   await axios.get(`${remoteURL}/check`);
        //Fetch from remote
        await fetch(remoteURL, reponame);

        //NOW MERGING

    //Get current HEAD (active branch)
    const headPath = path.join(CVS_DIR, "HEAD");
    if (!fs.existsSync(headPath)) {
      console.log("HEAD not found. Is this a valid CVS repo?");
      return;
    }

    const branchName = fs.readFileSync(headPath, "utf-8").trim();

    //  Validate fetched remote branch exists
    const remoteBranchDir = path.join(CVS_DIR, "remote", reponame, "branches");
    const remoteCommitsDir = path.join(CVS_DIR, "remote", reponame, "commits");
    if (!fs.existsSync(remoteBranchDir) && !fs.existsSync(remoteCommitsDir)) {
        console.log("There is nothing to merge");
        return;
      }
      //remote branches into branches folder
      fs.cpSync(remoteBranchDir,path.join(CVS_DIR,"branches"), {recursive: true});
      console.log("Branches Merged")
    //commits   
    const localCommitsPath=path.join(CVS_DIR,"commits");
const localCommits= fs.readFileSync(path.join(CVS_DIR,"branches",`${branchName}-history.json`),"utf-8")
fs.readdirSync(remoteCommitsDir).forEach(commitHash => {
    if (!localCommits.includes(commitHash)) {
      const destDir = path.join(localCommitsPath, commitHash);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir);
      }
  
      // Copy commit files
      const srcDir = path.join(remoteCommitsDir, commitHash);
      fs.readdirSync(srcDir).forEach(file => {
        const srcFile = path.join(srcDir, file);
        const destFile = path.join(destDir, file);
        fs.copyFileSync(srcFile, destFile);
      });
  
      // Update history.json
      const historyPath = path.join(CVS_DIR, "branches", `${branchName}-history.json`);
      const historyData = fs.existsSync(historyPath)
        ? JSON.parse(fs.readFileSync(historyPath, "utf-8"))
        : [];
  
      if (!historyData.includes(commitHash)) {
        historyData.push(commitHash);
        fs.writeFileSync(historyPath, JSON.stringify(historyData, null, 2));
      }
    }
  });
  const remoteRepoPath = path.join(CVS_DIR, "remote", reponame);
if (fs.existsSync(remoteRepoPath)) {
  fs.rmSync(remoteRepoPath, { recursive: true, force: true });
  console.log(` Cleaned up fetched remote folder: ${remoteRepoPath}`);
  fs.rmSync(path.join(CVS_DIR, "remote"), { recursive: true, force: true });

}
  } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
          console.error(`Could not reach remote server at ${remoteURL}. Check the URL `);
        } else if (err.response?.status === 404) {
          console.error(`Repository "${reponame}" not found on remote server.`);
        } else {
          console.error(`Pull failed: ${err.response?.status || 'UNKNOWN'} - ${err.response?.statusText || err.message}`);
        }
      } else {
        console.error(" Unexpected error during pull:", err.message);
      }
    }
}

module.exports = { pull };

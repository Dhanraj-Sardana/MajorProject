const axios = require("axios");
const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");
const fsExtra = require("fs-extra");

const CVS_DIR = path.resolve(__dirname, "../../CVS/mycvs");

//  Helper to unzip safely (wait for all file writes)
async function unzipZip(zipPath, extractPath) {

  await fsExtra.ensureDir(extractPath);
  const streams = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Parse())
      .on("entry", (entry) => {
        const filePath = path.join(extractPath, entry.path);

        if (entry.type === "Directory") {
          fsExtra.ensureDirSync(filePath);
          entry.autodrain();
        } else {
          fsExtra.ensureDirSync(path.dirname(filePath));
          const stream = fs.createWriteStream(filePath);
          entry.pipe(stream);
          streams.push(
            new Promise((res, rej) => {
              stream.on("finish", res);
              stream.on("error", rej);
            })
          );
        }
      })
      .on("close", resolve)
      .on("error", reject);
  });

  await Promise.all(streams); //  Wait for all files to finish
}

async function fetch(remoteURL, reponame) {
  try {
    if (!fs.existsSync(CVS_DIR)) {
      console.log("Repository is not initialized.");
      return;
    }

    await axios.get(`${remoteURL}/check`);

    const zipPath = path.join(__dirname, "fetch-temp.zip");

    const response = await axios({
      url: `${remoteURL}/fetch/${reponame}`,
      method: "GET",
      responseType: "stream",
    });

    const writer = fs.createWriteStream(zipPath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const tempExtractPath = path.join(__dirname, `temp-remote-${reponame}`);
    await fsExtra.emptyDir(tempExtractPath);
    await unzipZip(zipPath, tempExtractPath); //  Safe unzip
    fs.unlinkSync(zipPath);

    // Compare branches and commits
    const cleanDirs = (dirPath) =>
      fs.existsSync(dirPath)
        ? fs
            .readdirSync(dirPath)
            .filter(
              (entry) =>
                fs.existsSync(path.join(dirPath, entry)) &&
                fs.lstatSync(path.join(dirPath, entry)).isDirectory()
            )
        : [];

    const localBranchesPath = path.join(CVS_DIR, "branches");
    const remoteBranchesPath = path.join(tempExtractPath, "branches");
    const localCommitsPath = path.join(CVS_DIR, "commits");
    const remoteCommitsPath = path.join(tempExtractPath, "commits");

    const localBranches = fs.existsSync(localBranchesPath)
      ? fs.readdirSync(localBranchesPath)
      : [];

    const remoteBranches = fs.existsSync(remoteBranchesPath)
      ? fs.readdirSync(remoteBranchesPath)
      : [];

    const localCommits = cleanDirs(localCommitsPath);
    const remoteCommits = cleanDirs(remoteCommitsPath);

    const newBranches = remoteBranches.filter((b) => !localBranches.includes(b));
    const newCommits = remoteCommits.filter((c) => !localCommits.includes(c));
    const extraLocalBranches = localBranches.filter((b) => !remoteBranches.includes(b));
    const extraLocalCommits = localCommits.filter((c) => !remoteCommits.includes(c));

    if (extraLocalBranches.length > 0 || extraLocalCommits.length > 0) {
      console.log("Local repo is ahead of remote. Fetch aborted.");
      fsExtra.removeSync(tempExtractPath);
      return;
    }

    if (newBranches.length === 0 && newCommits.length === 0) {
      console.log("Already up to date.");
      fsExtra.removeSync(tempExtractPath);
      return;
    }

    const remoteStoragePath = path.join(CVS_DIR, "remote", reponame);
    await fsExtra.ensureDir(remoteStoragePath);

    if (newBranches.length > 0) {
      const destBranches = path.join(remoteStoragePath, "branches");
      await fsExtra.ensureDir(destBranches);
      newBranches.forEach((branch) => {
        fsExtra.copyFileSync(
          path.join(remoteBranchesPath, branch),
          path.join(destBranches, branch)
        );
      });
    }

    if (newCommits.length > 0) {
      const destCommits = path.join(remoteStoragePath, "commits");
      await fsExtra.ensureDir(destCommits);
      newCommits.forEach((commit) => {
        fsExtra.copySync(
          path.join(remoteCommitsPath, commit),
          path.join(destCommits, commit)
        );
      });
    }

    fsExtra.removeSync(tempExtractPath);
    console.log(
      ` Fetched ${newCommits.length} new commits and ${newBranches.length} branches into '.mycvs/remote/${reponame}'`
    );
  }catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
          console.error(`Could not reach remote server at ${remoteURL}. Check the URL `);
        } else if (err.response?.status === 404) {
          console.error(`Repository "${reponame}" not found on remote server.`);
        } else {
          console.error(`Clone failed: ${err.response?.status || 'UNKNOWN'} - ${err.response?.statusText || err.message}`);
        }
      } else {
        console.error(" Unexpected error during fetch:", err.message);
      }
    }
}

module.exports = { fetch };

const fs = require("fs");
const archiver = require("archiver");
const axios = require("axios");
const path = require("path");
const FormData = require("form-data");

async function pushToServer(remoteURL, reponame) {
  try {
    await axios.get(`${remoteURL}/check`);

    const cvsPath = path.resolve(__dirname, "../../CVS/mycvs");
    const archivePath = path.join(__dirname, "temp-push.zip");

    const output = fs.createWriteStream(archivePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);

    // Add only specific folders/files
    const commitsPath = path.join(cvsPath, "commits");
    const branchesPath = path.join(cvsPath, "branches");
    const headFilePath = path.join(cvsPath, "HEAD");

    if (fs.existsSync(commitsPath)) {
      archive.directory(commitsPath, "commits");
    }

    if (fs.existsSync(branchesPath)) {
      archive.directory(branchesPath, "branches");
    }

    if (fs.existsSync(headFilePath)) {
      archive.file(headFilePath, { name: "HEAD" });
    }

    await archive.finalize();

    await new Promise((resolve, reject) => {
      output.on("close", resolve);
      output.on("error", reject);
    });

    const form = new FormData();
    form.append("repo", fs.createReadStream(archivePath));
    form.append("reponame", reponame);

    await axios.post(`${remoteURL}/push`, form, {
      headers: form.getHeaders(),
    });

    console.log("Repo pushed successfully!");

    fs.unlinkSync(archivePath);
  } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
          console.error(`Could not reach remote server at ${remoteURL}. Check the URL `);
        }  else {
          console.error(`Clone failed: ${err.response?.status || 'UNKNOWN'} - ${err.response?.statusText || err.message}`);
        }
      } else {
        console.error(" Unexpected error during push :", err.message);
      }
    }
}

module.exports = { pushToServer };

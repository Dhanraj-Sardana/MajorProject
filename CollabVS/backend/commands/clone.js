const fs = require("fs");
const path = require("path");
const axios = require("axios");
const unzipper = require("unzipper");
const CVS_DIR = path.resolve(__dirname, "../../CVS/mycvs");
async function clone(remoteURL, reponame) {
  try {
     if (!fs.existsSync(CVS_DIR)) {
          console.log("Repository is not initialized.");
          return;
        }
    await axios.get(`${remoteURL}/check`);
    const zipPath = path.join(__dirname,'../../CVS', "temp.zip");

    const response = await axios({
      url: `${remoteURL}/clone/${reponame}`,
      method: "GET",
      responseType: "stream"
    });

    const writer = fs.createWriteStream(zipPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const extractPath = path.join(__dirname,'../../CVS', `remote-${reponame}`);
    await fs.promises.mkdir(extractPath, { recursive: true });

    await fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();
    
    // Cleanup
    fs.unlinkSync(zipPath);
    console.log("Cloned from remote successfully.");

  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        console.error(`Could not reach remote server at ${remoteURL}. Check the URL `);
      } else if (err.response?.status === 404) {
        console.error(`Repository "${reponame}" not found on remote server.`);
      } else {
        console.error(`Clone failed: ${err.response?.status || 'UNKNOWN'} - ${err.response?.statusText || err.message}`);
      }
    } else {
      console.error(" Unexpected error during clone:", err.message);
    }
  }
}

module.exports = { clone };

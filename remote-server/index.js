const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const unzipper = require("unzipper");
const cors = require("cors");
const archiver = require("archiver");
const AdmZip = require("adm-zip");
const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

const REMOTE_ROOT = path.join(__dirname, "remotes");

// Create directory structure for a user/repo
function ensureRepoDir(reponame) {
  const target = path.join(REMOTE_ROOT, reponame);
  fs.mkdirSync(target, { recursive: true });
  return target;
}


app.get("/check", (req, res) => {
  res.status(200).send("Remote server is active");
});

// Push Endpoint
app.post("/push", upload.single("repo"), async (req, res) => {
  try {
    const { reponame } = req.body;
    if (!reponame || !req.file) {
      return res.status(400).send("Missing required fields.");
    }

    const targetDir = ensureRepoDir(reponame);

    const zip = new AdmZip(req.file.path);
    zip.extractAllTo(targetDir, true); // Overwrite and extract completely

    fs.unlinkSync(req.file.path);
    res.send("Push successful!");
  } catch (err) {
    console.error("Push error:", err);
    res.status(500).send("Server error during push.");
  }
});

// clone Endpoint
app.get("/clone/:reponame", async (req, res) => {
  const { reponame } = req.params;
  const repoPath = path.join(__dirname, "remotes", reponame);
  // Check if repo exists
  if (!fs.existsSync(repoPath)) {
    return res.status(404).send("Repository not found");
  }


  // Create zip archive
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename=${reponame}.zip`);

  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.directory(repoPath, false); // false to avoid including folder name
  archive.pipe(res);

  archive.finalize();
});

//fetch Endpoint
app.get("/fetch/:reponame", async (req, res) => {
  const { reponame } = req.params;
  const repoPath = path.join(REMOTE_ROOT, reponame);

  if (!fs.existsSync(repoPath)) {
    console.log("Repo folder does not exist!");
    return res.status(404).send("Repository not found");
  }

  const tempZipName = `${reponame}_fetch.zip`;

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename=${tempZipName}`);

  const archive = archiver("zip", { zlib: { level: 9 } });

  // Only include 'branches' and 'commits' folders
  const branchesPath = path.join(repoPath, "branches");
  const commitsPath = path.join(repoPath, "commits");

  if (fs.existsSync(branchesPath)) {
    archive.directory(branchesPath, "branches");
  }
  if (fs.existsSync(commitsPath)) {
    archive.directory(commitsPath, "commits");
  }

  archive.pipe(res);
  archive.finalize();
});



// Start the server
app.listen(3000, (err) => {
  if (err) console.log(err);
  console.log("CollabVS Remote Server running on http://localhost:3000");
});

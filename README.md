#  CollabVS - A Custom Version Control System

**CollabVS** (Collaborative Versioning System) is a fully custom version control system built using **Node.js**
and the native **file system module** — no Git dependencies! It provides essential version control operations 
through a simple CLI, giving you hands-on understanding of how version control works under the hood.

---

##  Repository Structure

When initialized, a `.mycvs` directory is created containing:
.mycvs/ ├── HEAD # Tracks the current branch 
├── branches/ # Stores branch-specific data │
├── <branch>.json # Staging area for that branch │
├── <branch>-history.json # Commit history (list of hashes)
├── <branch>-state.json #  tracks the file snapshot (what files existed last time on this branch — useful for restoring deleted files when switching branches).
├── commits/ # Folder for each commit │
└── <commit-hash>/ │ 
├── message.txt # Commit message │ 
└── <filename> # Snapshot of committed file

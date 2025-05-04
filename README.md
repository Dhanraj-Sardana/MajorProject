#  CollabVS - A Custom Version Control System

**CollabVS** (Collaborative Versioning System) is a fully custom version control system built using **Node.js**
and the native **file system module** — no Git dependencies! It provides essential version control operations. It features a modern frontend developed with **React and Vite** for fast, optimized development, styled using **Tailwind CSS**.
Used **Electron** to communicate with native desktop API
through a simple CLI, giving you hands-on understanding of how version control works under the hood.
It also includes a GUI interface, enabling developers to manage repositories and version history through an interface

---

##  Repository Structure

When initialized, a `.mycvs` directory is created containing:

```
.mycvs/
├── HEAD                     # Tracks the current branch
├── branches/                # Stores branch-specific data
│   ├── <branch>.json           # Staging area for that branch
│   ├── <branch>-history.json   # Commit history (list of hashes)
│   └── <branch>-state.json     # Tracks file snapshot (for branch switching recovery)
├── commits/                # Folder for each commit
│   └── <commit-hash>/
│       ├── message.txt         # Commit message
│       └── <filename>          # Snapshot of committed file
```



## Version Control Command Reference

This is a reference guide for commonly used version control commands.

## Repository Management

- **`init`**  
  Initialize a new repository.

## Staging and Committing

- **`add <file>`**  
  Add a file to the staging area.

- **`commit <msg>`**  
  Commit staged changes with a message.

## Viewing Changes

- **`log`**  
  View the commit history.

- **`status`**  
  Check working directory and staged changes.

## Working with Commits

- **`checkout <commitId>`**  
  Restore working directory to a previous commit.

- **`revert <commitId>`**  
  Revert the repository to a specific commit.

## Branching

- **`branch <name>`**  
  Create a new branch.

- **`switchBranch <name>`**  
  Switch to a different branch.

- **`merge <branchName>`**  
  Merge another branch into the current branch.

- **`rebase <branchName>`**  
  Rebase the current branch onto another branch.

## Remote Repositories

- **`push <remotePath>`**  
  Push the local repository to a remote path.

- **`pull <remotePath>`**  
  Pull changes from a remote repository.

- **`fetch <remotePath>`**  
  Fetch updates from a remote repository without merging.

- **`clone <remotePath>`**  
  Clone a remote repository to your local machine.

## Stashing

- **`stash`**  
  Temporarily save changes without committing.

- **`stash-pop`**  
  Re-apply the latest stash and remove it from the stash list.


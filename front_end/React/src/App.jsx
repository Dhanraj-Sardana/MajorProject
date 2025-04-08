import React, { useState } from 'react';

function App() {
  const [output, setOutput] = useState('');
  const [message, setMessage] = useState('');
  const [filename, setFilename] = useState('');
  const [logs, setLogs] = useState([]); // for parsed log data
  const [newBranch, setNewBranch] = useState('');
  const [targetBranch, setTargetBranch] = useState('');
  
  const run = async (command, isLog = false) => {
    if (!window.electronAPI) {
      setOutput("Electron API not available.");
      return;
    }

    const out = await window.electronAPI.runCommand(command);
    setOutput(out || "No output");

    // If it's log output, parse it and store separately
    if (isLog && out) {
      const parsed = out
        .trim()
        .split('\n')
        .map((line) => {
          const match = line.match(/^Commit (\w+): (.+)$/);
          return match ? { id: match[1], msg: match[2] } : null;
        })
        .filter(Boolean);

      setLogs(parsed);
    }
  };

  const handleCheckout = (commitID) => {
    run(`node ../../backend/cvs.js checkout ${commitID}`);
  };

  return (
    <div className="p-6 space-y-4 font-mono">
      <h1 className="text-2xl font-bold">CollabVS GUI</h1>

      <button onClick={() => run('node ../../backend/cvs.js init')} className="bg-blue-500 text-white px-4 py-2 rounded">Init</button>

      <div>
        <input
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="Filename"
          className="border px-2 py-1 mr-2"
        />
        <button
          onClick={() => run(`node ../../backend/cvs.js add ${filename}`)}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={!filename}
        >
          Add
        </button>
      </div>

      <div>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Commit message"
          className="border px-2 py-1 mr-2 w-1/2"
        />
        <button
          onClick={() => run(`node ../../backend/cvs.js commit "${message}"`)}
          className="bg-purple-500 text-white px-4 py-2 rounded"
          disabled={!message}
        >
          Commit
        </button>
      </div>

      <button onClick={() => run('node ../../backend/cvs.js log', true)} className="bg-gray-700 text-white px-4 py-2 rounded">Log</button>

      <div className="bg-black text-green-400 p-4 overflow-auto h-64 whitespace-pre-wrap">
        {logs.length > 0 ? (
          logs.map((entry) => (
            <div key={entry.id}>
              <span
                onClick={() => handleCheckout(entry.id)}
                className="cursor-pointer text-cyan-300 hover:underline mr-2"
              >
                {entry.id}
              </span>
              : {entry.msg}
            </div>
          ))
        ) : (
          <pre>{output}</pre>
        )}
      </div>
      <div>
  <input
    value={newBranch}
    onChange={(e) => setNewBranch(e.target.value)}
    placeholder="New branch name"
    className="border px-2 py-1 mr-2"
  />
  <button
    onClick={() => run(`node ../../backend/cvs.js branch ${newBranch}`)}
    className="bg-yellow-500 text-white px-4 py-2 rounded"
    disabled={!newBranch}
  >
    Create Branch
  </button>
</div>


<div>
  <input
    value={targetBranch}
    onChange={(e) => setTargetBranch(e.target.value)}
    placeholder="Switch to branch"
    className="border px-2 py-1 mr-2"
  />
  <button
    onClick={() => run(`node ../../backend/cvs.js switchBranch ${targetBranch}`)}
    className="bg-indigo-500 text-white px-4 py-2 rounded"
    disabled={!targetBranch}
  >
    Switch Branch
  </button>
</div>
<button onClick={() => run('node ../../backend/cvs.js status', true)} className="bg-pink-700 text-white px-4 py-2 rounded">Status</button>

    </div>
  );
}

export default App;

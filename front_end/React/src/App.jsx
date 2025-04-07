import React, { useState } from 'react';

function App() {
    const [output, setOutput] = useState('');
    const [message, setMessage] = useState('');
    const [filename, setFilename] = useState('');

    const run = async (command) => {
        if (!window.electronAPI) {
            setOutput("Electron API not available.");
            return;
        }

        const out = await window.electronAPI.runCommand(command);
        setOutput(out || "No output");
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

            <button onClick={() => run('node ../../backend/cvs.js log')} className="bg-gray-700 text-white px-4 py-2 rounded">Log</button>

            <pre className="bg-black text-green-400 p-4 overflow-auto h-64 whitespace-pre-wrap">{output}</pre>
        </div>
    );
}

export default App;
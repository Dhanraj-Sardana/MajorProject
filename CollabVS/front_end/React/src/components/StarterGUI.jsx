import React, { useState, useRef } from 'react';
import OutputWindow from './OutputWindow';
import BasicFunction from './BasicFunction';


export default function StarterGUI() {
  const [output, setOutput] = useState('');
  const [message, setMessage] = useState('');
  const [filename, setFilename] = useState('');
  const [logs, setLogs] = useState([]); 
  const [newBranch, setNewBranch] = useState('');
  const [targetBranch, setTargetBranch] = useState('');
  const [mergeBranch, setMergeBranch] = useState('');
  const [isConflict, setIsConflict] = useState(false);
  const [conflictContent, setConflictContent] = useState('');
  const moreFunctionsRef = useRef(null);
 

  const run = async (command, isLog = false) => {
    if (!window.electronAPI) {
      setOutput("Electron API not available.");
      return;
    }

    const out = await window.electronAPI.runCommand(command);
    const outputText = out?.trim() || "No output";
    setOutput(outputText);

    if (out.includes('<<<<<<<') || out.includes('CONFLICT') || out.includes('=======')) {
      setIsConflict(true);
      setConflictContent(out);

      // Trigger conflict window
      if (window.electronAPI?.openConflictWindow) {
        window.electronAPI.openConflictWindow(out);
      } else {
        console.error("openConflictWindow not exposed in preload");
      }
    }

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

    <div className="m-0  h-full space-y-4 font-mono bg-[#031B2B]">
      <div className='flex items-center gap-20 bg-[#031B2B]'>
        <img className=" w-45 " src="/logo.jpeg" alt="" />
        <h1 className='font-extrabold text-4xl  bg-gradient-to-r from-[#41f478] to-[#3ac15d] text-transparent bg-clip-text'>Collaborative Version Control System</h1>
      </div>

      <BasicFunction/>
      <div class="flex justify-center mt-10 ">
      <div className=' flex flex-col space-y-4' >
      <button onClick={() => window.electronAPI.openRemoteWindow()} className="bg-gray-500  hover:bg-gray-700 text-white px-4   py-2 rounded " >Remote Operations</button>
      <button onClick={() => moreFunctionsRef.current?.scrollIntoView({ behavior: 'smooth' })} className='bg-gray-500  hover:bg-gray-700 mt-5 text-white px-4  py-2 rounded'>More Functions</button>
      </div>
      </div>
      <div ref={moreFunctionsRef} className='pt-56 px-4 sm:px-8 max-w-screen-lg mx-auto'>
        <OutputWindow logs={logs} handleCheckout={handleCheckout} output={output} />
        <div className='mx-5 my-5'>

          <input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Filename"
            className="border px-2 text-green-400  py-1 mr-2 w-1/2"
          />
          <button
            onClick={() => run(`node ../../backend/cvs.js add ${filename}`)}
            className="bg-gray-500 text-white px-4 py-2 hover:bg-gray-700 rounded"
            disabled={!filename}
          >
            Add
          </button>
        </div>

        <div className='mx-5 my-5'>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Commit message"
            className="border text-green-400 px-2 py-1 mr-2 w-1/2"
          />
          <button
            onClick={() => run(`node ../../backend/cvs.js commit "${message}"`)}
            className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded "
            disabled={!message}
          >
            Commit
          </button>
        </div>

        <div className='mx-5 my-5'>
          <input
            value={newBranch}
            onChange={(e) => setNewBranch(e.target.value)}
            placeholder="New branch name"
            className="border text-green-400 px-2 py-1 mr-2 w-1/2"
          />
          <button
            onClick={() => run(`node ../../backend/cvs.js branch ${newBranch}`)}
            className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
            disabled={!newBranch}
          >
            Create Branch
          </button>
        </div>

        <div className='mx-5 my-5'>
          <input
            value={targetBranch}
            onChange={(e) => setTargetBranch(e.target.value)}
            placeholder="Switch to branch"
            className="border text-green-400 px-2 py-1 mr-2 w-1/2"
          />
          <button
            onClick={() => run(`node ../../backend/cvs.js switchBranch ${targetBranch}`)}
            className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
            disabled={!targetBranch}
          >
            Switch Branch
          </button>
        </div>

        <div className='mx-5 pb-10'>
          <input
            value={mergeBranch}
            onChange={(e) => setMergeBranch(e.target.value)}
            placeholder="Branch to merge into current"
            className="border px-2 py-1 mr-2 w-1/2 text-green-400"
          />
          <button
            onClick={() => run(`node ../../backend/cvs.js merge ${mergeBranch}`)}
            className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
            disabled={!mergeBranch}
          >
            Merge Branch
          </button>
        </div>
        
       
      </div>
    </div>
  );

}

import React,{useState} from 'react'
import OutputWindow from './OutputWindow';
export default function BasicFunction() {
  const [logs, setLogs] = useState([]);
  const [output, setOutput] = useState('');
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
    <div>
      <OutputWindow logs={logs} handleCheckout={handleCheckout} output={output} />
      <div className='flex justify-center gap-14 mt-5'>
        <button onClick={() => run('node ../../backend/cvs.js log', true)} className="bg-gray-500  text-white hover:bg-gray-700 px-4 py-2 rounded">Log</button>
        <button onClick={() => run('node ../../backend/cvs.js init')} className="bg-gray-500   text-white px-8 hover:bg-gray-800 py-2 rounded">Init</button>
        <button onClick={() => run('node ../../backend/cvs.js status', true)} className="bg-gray-500  hover:bg-gray-700 text-white px-4 py-2 rounded">Status</button>
      </div>
    </div>
  )
}

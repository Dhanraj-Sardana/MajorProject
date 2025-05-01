import React,{useState} from 'react'
import Push from './Push'
import OutputWindow from './OutputWindow'
import Clone from './Clone'
import Fetch from './Fetch'
import Loading from './Loading'
import Pull from './Pull'
export default function Remote() {
  const [logs, setLogs] = useState([]); 
   const [output, setOutput] = useState('');
   const [loading, setLoading] = useState(false);
     const [remoteURL, setRemoteURL] = useState('');
     const [reponame, setReponame] = useState('');
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
    <div className="m-0  h-full space-y-4 font-mono bg-[#031B2B]">
      <div className='flex items-center gap-20 bg-[#031B2B]'>
        <img className=" w-45 " src="/logo.jpeg" alt="" />
        <h1 className='font-extrabold text-4xl  bg-gradient-to-r from-[#41f478] to-[#3ac15d] text-transparent bg-clip-text'>Collaborative Version Control System</h1>
      </div>
      {loading ? <Loading loading={loading} /> : <OutputWindow logs={logs} handleCheckout={handleCheckout} output={output} />}
      <div className='flex justify-center'>
      <input
        value={remoteURL}
        onChange={(e) => setRemoteURL(e.target.value)}
        placeholder="Remote URL"
        className="border text-green-400 px-2 py-1 w-1/4 mr-2"
      />
      <input
        value={reponame}
        onChange={(e) => setReponame(e.target.value)}
        placeholder="Repo Name"
        className="border text-green-400 px-2 w-1/4 py-1 mr-2"
      />
      </div>
      <div className='flex justify-center'>
      <div className='flex '>
       <Clone run={run} setGlobalLoading={setLoading} remoteURL={remoteURL} reponame={reponame} />
        <Push run={run} setGlobalLoading={setLoading} remoteURL={remoteURL} reponame={reponame} />
        <Fetch run={run} setGlobalLoading={setLoading} remoteURL={remoteURL} reponame={reponame}/>
        <Pull run={run} setGlobalLoading={setLoading} remoteURL={remoteURL} reponame={reponame}/> 
    </div>
    </div>
    </div>
  )
}

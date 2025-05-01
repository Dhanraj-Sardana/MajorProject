import React,{useState} from 'react'

export default function Pull({ run, setGlobalLoading,remoteURL,reponame }) {
    const [loading, setLoading] = useState(false);
  const handlePull= async()=>{
    try {
        setLoading(true);
        setGlobalLoading(true); 
        await run(`node ../../backend/cvs.js pull ${remoteURL} ${reponame}`);
      } catch (error) {
        console.error('Push failed', error);
      } finally {
        setLoading(false);
        setGlobalLoading(false); 
      }
  }
    return (
    <div className='mx-5 my-5'>
     
      <button
        onClick={handlePull}
        className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
        disabled={loading || !remoteURL || !reponame}
      >
        {loading ? "Pulling..." : "Pull"}
      </button>
    </div>
  )
}

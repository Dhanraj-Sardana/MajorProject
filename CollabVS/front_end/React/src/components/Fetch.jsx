import React,{useState} from 'react'

export default function Fetch({run,setGlobalLoading,remoteURL,reponame}) {
   const [loading, setLoading] = useState(false); 
   const handleFetch = async () => {
     try {
       setLoading(true);
       setGlobalLoading(true); 
       await run(`node ../../backend/cvs.js fetch ${remoteURL} ${reponame}`);
     } catch (error) {
       console.error('Fetch failed', error);
     } finally {
       setLoading(false);
       setGlobalLoading(false); 
     }
   };
 
   return (
     <div className='mx-5 my-5 pb-10'>
       <button
         onClick={handleFetch}
         className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
         disabled={loading || !remoteURL || !reponame}
       >
         {loading ? "Fetching..." : "Fetch"}
       </button>
     </div>
  )
}

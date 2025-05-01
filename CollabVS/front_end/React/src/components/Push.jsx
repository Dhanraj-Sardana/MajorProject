import React, { useState } from 'react';

export default function Push({ run, setGlobalLoading,remoteURL,reponame }) {
  const [loading, setLoading] = useState(false);

  const handlePush = async () => {
    try {
      setLoading(true);
      setGlobalLoading(true); 
      await run(`node ../../backend/cvs.js push ${remoteURL} ${reponame}`);
    } catch (error) {
      console.error('Push failed', error);
    } finally {
      setLoading(false);
      setGlobalLoading(false); 
    }
  };

  return (
    <div className='mx-5 my-5'>
     
      <button
        onClick={handlePush}
        className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
        disabled={loading || !remoteURL || !reponame}
      >
        {loading ? "Pushing..." : "Push"}
      </button>
    </div>
  );
}

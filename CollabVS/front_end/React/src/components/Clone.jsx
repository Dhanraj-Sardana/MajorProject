import React, { useState } from 'react';

export default function Clone({ run, setGlobalLoading,remoteURL,reponame }) {
  const [loading, setLoading] = useState(false);

  const handleClone = async () => {
    if (!remoteURL || !reponame) return;

    try {
      setLoading(true);
      setGlobalLoading(true); 
      await run(`node ../../backend/cvs.js clone ${remoteURL} ${reponame}`);
    } catch (error) {
      console.error("error cloning", error);
    } finally {
      setLoading(false);
      setGlobalLoading(false); 
    }
  };

  return (
    <div className='mx-5 my-5'>
      <button
        onClick={handleClone}
        className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
        disabled={loading || !remoteURL || !reponame}
      >
        {loading ? "Cloning..." : "Clone"}
      </button>
    </div>
  );
}
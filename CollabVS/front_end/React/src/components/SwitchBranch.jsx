import React, { useState } from 'react'
export default function switchBranch({run}) {
    const [targetBranch, setTargetBranch] = useState('');
  return (
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
  )
}

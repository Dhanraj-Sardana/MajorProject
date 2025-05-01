import React, { useState } from 'react'
export default function Branch({run}) {
      const [newBranch, setNewBranch] = useState('');
  return (
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
  )
}

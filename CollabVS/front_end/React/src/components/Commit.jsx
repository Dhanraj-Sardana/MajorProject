import React, { useState } from 'react'

export default function Commit({run}) {
     const [message, setMessage] = useState('');
  return (
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
  )
}

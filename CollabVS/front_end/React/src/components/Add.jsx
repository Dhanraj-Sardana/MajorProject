import React, { useState } from 'react'

export default function Add({run}) {
  const [filename, setFilename] = useState('');
    return (
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
  )
}

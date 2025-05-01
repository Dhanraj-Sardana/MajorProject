import React,{useState} from 'react'

export default function Merge({run}) {
    const [mergeBranch, setMergeBranch] = useState('');
  return (
    <div className='mx-5 my-5'>
          <input
            value={mergeBranch}
            onChange={(e) => setMergeBranch(e.target.value)}
            placeholder="Branch to merge into current"
            className="border px-2 py-1 mr-2 w-1/2 text-green-400"
          />
          <button
            onClick={() => run(`node ../../backend/cvs.js merge ${mergeBranch}`)}
            className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
            disabled={!mergeBranch}
          >
            Merge Branch
          </button>
        </div>
  )
}

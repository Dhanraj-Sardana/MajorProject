import React,{useState} from 'react'

export default function Rebase({run}) {
    const [targetBranch,setTargetBranch]=useState("");
  return (
    <div className='mx-5 pb-10'>
    <input
      value={targetBranch}
      onChange={(e) => setTargetBranch(e.target.value)}
      placeholder="Target Branch"
      className="border text-green-400 px-2 py-1 mr-2 w-1/2"
    />
    <button
      onClick={() => run(`node ../../backend/cvs.js rebase "${targetBranch}"`)}
      className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded "
      disabled={!targetBranch}
    >
      Rebase
    </button>
  </div>
  )
}

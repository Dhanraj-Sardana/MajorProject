import React from 'react'

export default function OutputWindow({logs,handleCheckout,output}) {
  return (
    <div className="bg-black text-green-400 p-4 overflow-auto h-64 whitespace-pre-wrap">
    {logs.length > 0 ? (
      logs.map((entry) => (
        <div key={entry.id}>
          <span
            onClick={() => handleCheckout(entry.id)}
            className="cursor-pointer text-cyan-300 hover:underline mr-2"
          >
            {entry.id}
          </span>
          : {entry.msg}
        </div>
      ))
    ) : (
      <pre>{output}</pre>
    )}
  </div>
  )
}

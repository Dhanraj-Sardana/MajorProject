import React from 'react'

export default function Stashing({run}) {
    return (
        <div className='flex justify-center gap-7 mt-5'>
            <button onClick={() => run('node ../../backend/cvs.js stash')} className="bg-gray-500  text-white hover:bg-gray-700 px-4 py-2 rounded">Stash</button>
            <button onClick={() => run('node ../../backend/cvs.js stash-pop')} className="bg-gray-500  text-white hover:bg-gray-700 px-4 py-2 rounded">Stash-Pop</button>
        </div>
    )
}

import React from 'react'

export default function Loading({loading}) {
  return (
    <div className='flex justify-center py-45'>
      {loading && <div className="mt-2 w-12 h-12 border-4 border-gray-400 border-l-green-500 rounded-full animate-spinr"> </div>}
    </div>
  )
}

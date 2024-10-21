import React from 'react'


function Profileinfo({userInfo, onLogout}) {
  return (
    <div className='flex items-center gap-3'>
        <div>
            <p className='text-sm font-medium'>{userInfo ?
             <div>{userInfo.fullName}</div> 
             : 
             <div>Loading...</div>}</p>
            <button className='text-sm text-slate-700 underline' 
              onClick={onLogout}>
              Logout
            </button>
        </div>

    </div>
  )
}

export default Profileinfo
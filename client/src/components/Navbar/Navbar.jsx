import React, { useState } from 'react'
import Profileinfo from '../Cards/Profileinfo'
import { useNavigate } from "react-router-dom"

const Navbar = ({userInfo}) => {
  const [searchQuery, setSearchQuery] =useState("")
  const navigate = useNavigate()
  const onLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  const handleSearch = (e) => {
    e.preventDefault()
  }

  const onClearSearch = () => {
    setSearchQuery("");
  }

  return (
    <div className='bg-white flex items-center justify-between px-6 py-2 drop-shadow'> 
       <h2 className='text-xl font-medium text-black py-2'>SNotes</h2>
    
       <Profileinfo userInfo={userInfo} onLogout={onLogout}/>
    </div>
  )
}

export default Navbar

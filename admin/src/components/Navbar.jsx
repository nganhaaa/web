import React from 'react'
import {assets} from '../assets/assets'
import './ChristmasNavbar.css'

const Navbar = ({setToken}) => {
  return (
    <div className='christmas-navbar flex items-center justify-between py-4 px-[4%]'>
      <div className="flex items-center gap-3">
        <img className='w-[max(10%,80px)] brightness-0 invert' src={assets.logo} alt="" />
        <span className="text-white font-bold text-xl hidden sm:block">Admin Panel</span>
      </div>
      <button onClick={() => setToken('')} className='christmas-button'>Logout</button>
    </div>
  )
}

export default Navbar
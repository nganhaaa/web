import React from 'react'
import {assets} from '../assets/assets'
import './ChristmasNavbar.css'

const Navbar = ({setToken}) => {
  return (
    <div className='christmas-navbar flex items-center justify-between py-4 px-[4%]' style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-white" style={{ letterSpacing: '0.1em' }}>SHOPWEB</span>
        <span className="text-white font-bold text-xl hidden sm:block">Admin Panel</span>
      </div>
      <button onClick={() => setToken('')} className='christmas-button'>Logout</button>
    </div>
  )
}

export default Navbar
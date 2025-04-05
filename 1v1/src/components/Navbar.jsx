import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import logo from '../assets/logo.svg'
import '../css/nav.css'


const Navbar = () => {
  return (
    <div className='nav'>  
        <div className='image'>
            <Link to="/" className="logo-link" end><img src={logo} alt="Logo" /></Link>
        </div>
        <div className='nav-link'>
            <NavLink to='/' className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
            <NavLink to='/about' className={({isActive}) => isActive ? 'active' : ''}>About</NavLink>
            <NavLink to='/contact' className={({isActive}) => isActive ? 'active' : ''}>Contact</NavLink>
        </div>
    </div>
  )
}

export default Navbar

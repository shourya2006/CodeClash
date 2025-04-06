import React, { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import logo from '../assets/logo.svg'
import '../css/nav.css'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className='nav'>  
        <div className='image'>
            <Link to="/" className="logo-link" end><img src={logo} alt="Logo" /></Link>
        </div>

        <div className="menu-icon" onClick={toggleMenu}>
          <div className={`menu-line ${menuOpen ? 'open' : ''}`}></div>
          <div className={`menu-line ${menuOpen ? 'open' : ''}`}></div>
          <div className={`menu-line ${menuOpen ? 'open' : ''}`}></div>
        </div>

        <div className={`nav-link ${menuOpen ? 'open' : ''}`}>
            <NavLink to='/' className={({isActive}) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to='/about' className={({isActive}) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>About</NavLink>
            <NavLink to='/contact' className={({isActive}) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>Contact</NavLink>
        </div>
        
        {menuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}
    </div>
  )
}

export default Navbar

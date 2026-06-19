import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const navigate = useNavigate();

  const fetchProfileStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const user = await res.json();
        const isIncomplete = !user.firstName || !user.lastName || !user.address;
        setProfileIncomplete(isIncomplete);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    if (token) {
      fetchProfileStatus();
    }

    const handleProfileUpdate = () => {
      fetchProfileStatus();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleUserClick = () => {
    if (isLoggedIn) {
      setIsProfileOpen(!isProfileOpen);
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsProfileOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: "Home Page", href: "/#home" },
    { 
      name: "Bangles", 
      dropdown: [
        { name: "Glass Bangles", href: "/#glass-bangles" },
        { name: "Baby Shower", href: "/#baby-shower" },
        { name: "Antique Bangles", href: "/#antique-bangles" },
        { name: "Combos", href: "/#combos" },
        { name: "Plus Size Bangles", href: "/#plus-size-bangles" }
      ]
    },
    { 
      name: "Terracotta Jewellery", 
      dropdown: [
        { name: "Daily wear", href: "/#daily-wear" },
        { name: "Jumkas", href: "/#jumkas" },
        { name: "Studs", href: "/#studs" },
        { name: "Jewellery Set", href: "/#jewellery-set" },
        { name: "Bridal Set", href: "/#bridal-set" },
        { name: "Kids wear", href: "/#kids-wear" }
      ]
    },
    { name: "Organiser", href: "/#organiser" },
    { name: "Hampers", href: "/#hampers" },
    { name: "Contact Us", href: "/#contact-us" },
    { name: "About Us", href: "/#about-us" }
  ];

  return (
    <div className="store-navbar-wrapper">
      {/* Top Banner */}
      <div className="top-banner">
        <p>Welcome To Our Store</p>
      </div>

      <nav className="store-navbar">
        {/* Main Header Area */}
        <div className="navbar-main">
          {/* Logo Area */}
          <div className="navbar-logo-container">
            <h1 className="store-logo">
              RaHa <span className="logo-accent">Creations</span>
            </h1>
          </div>

          {/* Desktop Right Icons */}
          <div className="navbar-icons desktop-only">
            <button className="icon-btn" aria-label="Search">
              <Search size={22} strokeWidth={1.5} />
            </button>
            
            {/* User Icon with Profile Dropdown */}
            <div className="user-dropdown-container">
              <button 
                className={`icon-btn ${isLoggedIn ? 'active' : ''}`} 
                aria-label="User profile" 
                onClick={handleUserClick}
                style={{ position: 'relative' }}
              >
                <User size={22} strokeWidth={1.5} color={isLoggedIn && isProfileOpen ? "var(--primary)" : "currentColor"} />
                {isLoggedIn && profileIncomplete && (
                  <span className="gold-dot"></span>
                )}
              </button>
              
              {/* Profile Dropdown Menu */}
              {isProfileOpen && isLoggedIn && (
                <div className="profile-dropdown">
                  <div className="profile-links">
                    <button className="profile-item" onClick={() => { setIsProfileOpen(false); navigate('/user-dashboard'); }}>
                      <User size={16} /> Dashboard
                    </button>
                    <div className="profile-divider"></div>
                    <button className="profile-item logout-text" onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="icon-btn" aria-label="Shopping bag">
              <ShoppingBag size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="mobile-toggle" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </div>
        </div>

        {/* Categories Navigation */}
        <div className={`navbar-categories ${isMobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map((link, index) => (
            link.dropdown ? (
              <div key={index} className="nav-dropdown-container">
                <span className="category-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {link.name}
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <div className="nav-dropdown">
                  {link.dropdown.map((subLink, subIndex) => (
                    <a key={subIndex} href={subLink.href} className="nav-dropdown-item">
                      {subLink.name}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a key={index} href={link.href} className="category-link">
                {link.name}
              </a>
            )
          ))}
          {/* Mobile Only Icons in Menu */}
          <div className="navbar-icons mobile-only">
            <button className="icon-btn">
              <Search size={20} />
            </button>
            <div className="user-dropdown-container">
              <button className="icon-btn" onClick={handleUserClick} style={{ position: 'relative' }}>
                <User size={20} color={isLoggedIn ? "var(--primary)" : "currentColor"} />
                {isLoggedIn && profileIncomplete && (
                  <span className="gold-dot"></span>
                )}
              </button>
            </div>
            <button className="icon-btn">
              <ShoppingBag size={20} />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

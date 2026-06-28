import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, LogOut, Plus, Minus, Sparkles, Gift } from 'lucide-react';
import API_BASE from '../config/api';
import { isFestivalActive } from '../utils/festivalPrice';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const navigate = useNavigate();

  // Reference & height state for dynamic mobile menu alignment
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(105);

  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);

  // Cart States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Festival States
  const [activeFestival, setActiveFestival] = useState(null);
  const [festivalNotifDismissed, setFestivalNotifDismissed] = useState(false);

  const fetchProfileStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
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

  const fetchAllProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDbCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const data = await res.json();
        setDbCategories(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadCart = () => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);
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

  useEffect(() => {
    // Load products once for instant filtering
    fetchAllProducts();
    fetchDbCategories();
    loadCart();

    const handleCartUpdate = () => {
      loadCart();
    };

    const handleOpenCart = () => {
      setIsCartOpen(true);
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('openCartDrawer', handleOpenCart);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('openCartDrawer', handleOpenCart);
    };
  }, []);

  // Fetch active festival and check expiration
  useEffect(() => {
    const fetchActiveFestival = async () => {
      try {
        const res = await fetch(`${API_BASE}/festivals/active`);
        if (res.ok) {
          const data = await res.json();
          if (data && isFestivalActive(data)) {
            setActiveFestival(data);
          }
        }
      } catch (err) {
        console.error('Error fetching active festival:', err);
      }
    };
    fetchActiveFestival();

    // Check every minute if the festival has expired or started
    const interval = setInterval(() => {
      // If we don't have one active, maybe we should refetch? Or we can just let it be null until a page refresh.
      // But if we already have it in state, we should clear it when it expires:
      if (activeFestival) {
        if (!isFestivalActive(activeFestival)) {
          setActiveFestival(null);
        }
      } else {
         fetchActiveFestival();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [activeFestival]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = allProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
    setSearchResults(filtered.slice(0, 5));
  }, [searchQuery, allProducts]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      // Force scroll to top when opening
      const menu = document.querySelector('.navbar-categories');
      if (menu) menu.scrollTop = 0;
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    const newIsOpen = !isMobileMenuOpen;
    setIsMobileMenuOpen(newIsOpen);
    
    if (newIsOpen) {
      setTimeout(() => {
        const menu = document.querySelector('.navbar-categories');
        const items = document.querySelectorAll('.mobile-nav-item-safe');
        const bangles = document.querySelector('.mobile-subgroup');
        const dump = {
          menu_height: menu?.clientHeight,
          menu_top: menu?.getBoundingClientRect().top,
          menu_html: menu?.innerHTML.substring(0, 500),
          items: Array.from(items).map(el => ({
            text: el.innerText,
            top: el.getBoundingClientRect().top,
            height: el.clientHeight,
            display: window.getComputedStyle(el).display,
            visibility: window.getComputedStyle(el).visibility,
            opacity: window.getComputedStyle(el).opacity,
          })),
          bangles: {
            top: bangles?.getBoundingClientRect().top,
            height: bangles?.clientHeight,
          }
        };
        fetch(`${API_BASE}/api/dump`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dump)
        }).catch(err => console.error('Dump failed', err));
      }, 500);
    }
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

  const updateCartItemQty = (index, newQty) => {
    const currentCart = [...cartItems];
    if (newQty <= 0) {
      currentCart.splice(index, 1);
    } else {
      currentCart[index].quantity = newQty;
    }
    localStorage.setItem('cart', JSON.stringify(currentCart));
    setCartItems(currentCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeCartItem = (index) => {
    const currentCart = [...cartItems];
    currentCart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(currentCart));
    setCartItems(currentCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const getCategorySlug = (name) => `/category/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  const navLinks = [
    { name: "HOME PAGE", href: "/home" },
    { 
      name: "SHOP PRODUCTS", 
      dropdownGroups: [
        {
          title: "Bangles",
          items: dbCategories.filter(c => c.group === 'Bangles').map(c => ({ name: c.name, href: getCategorySlug(c.name) }))
        },
        {
          title: "Terracotta Jewellery",
          items: dbCategories.filter(c => c.group === 'Terracotta Jewellery').map(c => ({ name: c.name, href: getCategorySlug(c.name) }))
        }
      ]
    },
    { 
      name: "OUR SERVICES", 
      dropdown: dbCategories.filter(c => c.group === 'Our Services').map(c => ({ name: c.name, href: getCategorySlug(c.name) }))
    },
    { name: "SIZE FINDER", href: "/size-finder" }
  ];

  return (
    <>
      <div className="store-navbar-wrapper" ref={navbarRef}>
        {/* Top Banner */}
        <div className="top-banner">
          <div className="marquee-container">
            {/* Render two identical content blocks for seamless looping */}
            <div className="marquee-content" style={{ color: 'inherit' }}>
              {activeFestival ? (
                activeFestival.isDown ? (
                  [...Array(12)].map((_, i) => (
                    <span key={`down-1-${i}`} style={{ paddingRight: '3rem' }}>
                      <span className="festival-name-golden">{activeFestival.name}</span>
                      {' '} is down, we will get back soon!
                    </span>
                  ))
                ) : (
                  <Link to="/offer" style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }}>
                    {[...Array(12)].map((_, i) => (
                      <span key={`offer-1-${i}`} style={{ paddingRight: '3rem' }}>
                        <span className="festival-name-golden">{activeFestival.name}</span>
                        {' '} — {activeFestival.discountValue}{activeFestival.discountType === 'Percentage (%)' ? '%' : '₹'} OFF!
                      </span>
                    ))}
                  </Link>
                )
              ) : (
                [...Array(12)].map((_, i) => (
                  <span key={`free-1-${i}`} style={{ paddingRight: '3rem' }}>
                    🚚 FREE SHIPPING ON ALL ORDERS ABOVE ₹999!
                  </span>
                ))
              )}
            </div>
            
            <div className="marquee-content" style={{ color: 'inherit' }} aria-hidden="true">
              {activeFestival ? (
                activeFestival.isDown ? (
                  [...Array(12)].map((_, i) => (
                    <span key={`down-2-${i}`} style={{ paddingRight: '3rem' }}>
                      <span className="festival-name-golden">{activeFestival.name}</span>
                      {' '} is down, we will get back soon!
                    </span>
                  ))
                ) : (
                  <Link to="/offer" style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }}>
                    {[...Array(12)].map((_, i) => (
                      <span key={`offer-2-${i}`} style={{ paddingRight: '3rem' }}>
                        <span className="festival-name-golden">{activeFestival.name}</span>
                        {' '} — {activeFestival.discountValue}{activeFestival.discountType === 'Percentage (%)' ? '%' : '₹'} OFF!
                      </span>
                    ))}
                  </Link>
                )
              ) : (
                [...Array(12)].map((_, i) => (
                  <span key={`free-2-${i}`} style={{ paddingRight: '3rem' }}>
                    🚚 FREE SHIPPING ON ALL ORDERS ABOVE ₹999!
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <nav className="store-navbar">
          {isSearchOpen ? (
            <div className="navbar-search-overlay">
              <div className="search-input-container">
                <Search size={18} className="search-icon-inside" />
                <input
                  type="text"
                  placeholder="Search products, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-field"
                  autoFocus
                />
                <button className="search-close-btn" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} aria-label="Close search">
                  <X size={20} />
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="search-results-dropdown">
                  {searchResults.map((prod) => (
                    <Link 
                      key={prod._id} 
                      to={`/product/${prod._id}`} 
                      className="search-result-item"
                      onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                    >
                      <img src={prod.images[0] || 'https://via.placeholder.com/100'} alt={prod.name} className="search-result-thumb" />
                      <div className="search-result-info">
                        <span className="search-result-name">{prod.name}</span>
                        <span className="search-result-category">{prod.category}</span>
                        <span className="search-result-price">Rs. {prod.price.toFixed(2)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {searchQuery.trim() && searchResults.length === 0 && (
                <div className="search-results-dropdown empty-search">
                  <p>No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Logo Area */}
              <div className="navbar-logo-container">
                <Link to="/home" className="store-logo-link">
                  <h1 className="store-logo">
                    RaHa <span className="logo-accent">Creations</span>
                  </h1>
                </Link>
              </div>

              {/* Categories Navigation (Desktop Middle & Mobile) */}
              <div 
                className={`navbar-categories ${isMobileMenuOpen ? 'open' : ''}`}
              >
                {/* Desktop Menu Items */}
                <div className="desktop-only-menu-wrapper">
                  {navLinks.map((link, index) => {
                    if (link.dropdownGroups) {
                      return (
                        <div key={index} className="nav-dropdown-container mega-dropdown-container">
                          <span className="category-link" style={{ cursor: 'pointer' }}>
                            {link.name}
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <div className="nav-dropdown mega-dropdown">
                            <div className="mega-dropdown-grid">
                              {link.dropdownGroups.map((group, gIndex) => (
                                <div key={gIndex} className="mega-dropdown-column">
                                  <h4 className="mega-dropdown-title">{group.title}</h4>
                                  <div className="mega-dropdown-items">
                                    {group.items.map((subLink, subIndex) => {
                                      const catData = dbCategories.find(c => c.name === subLink.name);
                                      const isInactive = catData && catData.status === 'Inactive';
                                      
                                      return isInactive ? (
                                        <div key={subIndex} className="nav-dropdown-item inactive-category" title="We are currently not delivering products in this category!!" style={{ opacity: 0.5, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                          <X size={14} color="#ef4444" /> {subLink.name}
                                        </div>
                                      ) : (
                                        <Link key={subIndex} to={subLink.href} className="nav-dropdown-item">
                                          {subLink.name}
                                        </Link>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    } else if (link.dropdown) {
                      return (
                        <div key={index} className="nav-dropdown-container">
                          <span className="category-link" style={{ cursor: 'pointer' }}>
                            {link.name}
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <div className="nav-dropdown">
                            {link.dropdown.map((subLink, subIndex) => {
                              const catData = dbCategories.find(c => c.name === subLink.name);
                              const isInactive = catData && catData.status === 'Inactive';

                              return isInactive ? (
                                <div key={subIndex} className="nav-dropdown-item inactive-category" title="We are currently not delivering products in this category!!" style={{ opacity: 0.5, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <X size={14} color="#ef4444" /> {subLink.name}
                                </div>
                              ) : (
                                <Link key={subIndex} to={subLink.href} className="nav-dropdown-item">
                                  {subLink.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <Link key={index} to={link.href} className="category-link">
                          {link.name}
                        </Link>
                      );
                    }
                  })}
                  {activeFestival && !activeFestival.isDown && (
                    <Link to="/offer" className="category-link" style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="festival-name-golden" style={{ fontWeight: 600 }}>{activeFestival.name}</span>
                    </Link>
                  )}
                </div>

                {/* Mobile Menu Items */}
                <div className="mobile-only-menu-wrapper">
                  {/* HOME PAGE */}
                  <Link to="/home" className="mobile-nav-item-safe" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', width: '100%', padding: '1rem 0.5rem', color: '#0f172a', fontSize: '0.85rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0', visibility: 'visible', opacity: 1, minHeight: '40px', zIndex: 9999 }}>
                    HOME PAGE
                  </Link>

                  {/* SHOP PRODUCTS */}
                  <div className="mobile-dropdown-group-container">
                    <span className="mobile-nav-item-safe" style={{ display: 'flex', width: '100%', padding: '1rem 0.5rem', color: '#0f172a', fontSize: '0.85rem', fontWeight: '600', borderBottom: '1px solid #e2e8f0', visibility: 'visible', opacity: 1, minHeight: '40px', zIndex: 9999 }}>SHOP PRODUCTS</span>
                    <div className="mobile-group-content">
                      {navLinks[1].dropdownGroups.map((group, gIndex) => (
                        <div key={gIndex} className="mobile-subgroup">
                          <span className="mobile-subgroup-title">{group.title}</span>
                          <div className="mobile-subgroup-items">
                            {group.items.map((item, i) => {
                              const catData = dbCategories.find(c => c.name === item.name);
                              const isInactive = catData && catData.status === 'Inactive';

                              return isInactive ? (
                                <div key={i} className="nav-dropdown-item inactive-category" title="We are currently not delivering products in this category!!" style={{ opacity: 0.5, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <X size={14} color="#ef4444" /> {item.name}
                                </div>
                              ) : (
                                <Link key={i} to={item.href} className="nav-dropdown-item" onClick={() => setIsMobileMenuOpen(false)}>
                                  {item.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* OUR SERVICES */}
                  <div className="mobile-dropdown-group-container">
                    <span className="category-link mobile-group-header">OUR SERVICES</span>
                    <div className="mobile-group-content">
                      <div className="mobile-subgroup-items">
                        {navLinks[2].dropdown.map((item, i) => {
                          const catData = dbCategories.find(c => c.name === item.name);
                          const isInactive = catData && catData.status === 'Inactive';

                          return isInactive ? (
                            <div key={i} className="nav-dropdown-item inactive-category" title="We are currently not delivering products in this category!!" style={{ opacity: 0.5, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <X size={14} color="#ef4444" /> {item.name}
                            </div>
                          ) : (
                            <Link key={i} to={item.href} className="nav-dropdown-item" onClick={() => setIsMobileMenuOpen(false)}>
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SIZE FINDER */}
                  <Link to="/size-finder" className="category-link" onClick={() => setIsMobileMenuOpen(false)}>
                    SIZE FINDER
                  </Link>

                  {/* Festival Link in Mobile Menu */}
                  {activeFestival && !activeFestival.isDown && (
                    <Link to="/offer" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', padding: '1rem 0.5rem', borderTop: '1px solid #e2e8f0', textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Gift size={16} color="#d4af37" />
                        <span className="festival-name-golden" style={{ fontSize: '0.85rem', fontWeight: 700 }}>{activeFestival.name}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', paddingLeft: '1.5rem' }}>
                        {activeFestival.discountValue}{activeFestival.discountType === 'Percentage (%)' ? '%' : '₹'} OFF
                      </div>
                    </Link>
                  )}
                </div>
                
                {/* Mobile Only Icons inside menu */}
                <div className="navbar-icons mobile-only">
                  <div className="user-dropdown-container">
                    <button className="icon-btn" onClick={handleUserClick} style={{ position: 'relative' }}>
                      <User size={20} color={isLoggedIn ? "var(--primary)" : "currentColor"} />
                      {isLoggedIn && profileIncomplete && (
                        <span className="gold-dot"></span>
                      )}
                    </button>
                    {isProfileOpen && isLoggedIn && (
                      <div className="profile-dropdown">
                        <div className="profile-links">
                          <button className="profile-item" onClick={() => { setIsProfileOpen(false); setIsMobileMenuOpen(false); navigate('/user-dashboard'); }}>
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
                  <button className="icon-btn" onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }} style={{ position: 'relative' }}>
                    <ShoppingBag size={20} />
                    {cartItemCount > 0 && (
                      <span className="cart-badge">{cartItemCount}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Icons Area (Desktop Right) */}
              <div className="navbar-icons desktop-only">
                <button className="icon-btn" aria-label="Search" onClick={() => setIsSearchOpen(true)}>
                  <Search size={20} strokeWidth={1.5} />
                </button>
                
                <div className="user-dropdown-container">
                  <button 
                    className={`icon-btn ${isLoggedIn ? 'active' : ''}`} 
                    aria-label="User profile" 
                    onClick={handleUserClick}
                    style={{ position: 'relative' }}
                  >
                    <User size={20} strokeWidth={1.5} color={isLoggedIn && isProfileOpen ? "var(--primary)" : "currentColor"} />
                    {isLoggedIn && profileIncomplete && (
                      <span className="gold-dot"></span>
                    )}
                  </button>
                  
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

                <button className="icon-btn" aria-label="Shopping bag" onClick={() => setIsCartOpen(true)} style={{ position: 'relative' }}>
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  {cartItemCount > 0 && (
                    <span className="cart-badge">{cartItemCount}</span>
                  )}
                </button>
              </div>

              {/* Mobile Action Controls (Mobile Right) */}
              <div className="mobile-actions">
                <button className="icon-btn mobile-search" aria-label="Search" onClick={() => setIsSearchOpen(true)}>
                  <Search size={20} strokeWidth={1.5} />
                </button>
                
                <div className="user-dropdown-container mobile-user">
                  <button 
                    className={`icon-btn ${isLoggedIn ? 'active' : ''}`} 
                    aria-label="User profile" 
                    onClick={handleUserClick}
                    style={{ position: 'relative' }}
                  >
                    <User size={20} strokeWidth={1.5} color={isLoggedIn && isProfileOpen ? "var(--primary)" : "currentColor"} />
                    {isLoggedIn && profileIncomplete && (
                      <span className="gold-dot"></span>
                    )}
                  </button>
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

                <button className="icon-btn mobile-bag" aria-label="Shopping bag" onClick={() => setIsCartOpen(true)} style={{ position: 'relative' }}>
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  {cartItemCount > 0 && (
                    <span className="cart-badge">{cartItemCount}</span>
                  )}
                </button>
                <div className="mobile-toggle" onClick={toggleMobileMenu}>
                  {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </div>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Sliding Cart Drawer overlay */}
      {isCartOpen && (
        <>
          <div className="cart-drawer-backdrop" onClick={() => setIsCartOpen(false)}></div>
          <div className="cart-drawer">
            <div className="cart-drawer-header">
              <h2 className="cart-drawer-title">Shopping Cart ({cartItemCount})</h2>
              <button className="cart-drawer-close" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
                <X size={22} />
              </button>
            </div>

            <div className="cart-drawer-body">
              {cartItems.length === 0 ? (
                <div className="cart-empty-state">
                  <ShoppingBag size={48} className="cart-empty-icon" />
                  <p>Your cart is currently empty.</p>
                  <button className="btn-shop-now" onClick={() => setIsCartOpen(false)}>
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="cart-drawer-items">
                  {cartItems.map((item, idx) => (
                    <div key={`${item._id}-${item.size}`} className="cart-item-row">
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                      <div className="cart-item-details">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-meta">Size: {item.size}</span>
                        <span className="cart-item-price">Rs. {item.price.toFixed(2)}</span>
                        
                        <div className="cart-item-actions">
                          <div className="cart-qty-adjuster">
                            <button className="cart-qty-btn" onClick={() => updateCartItemQty(idx, item.quantity - 1)} aria-label="Decrease quantity">
                              <Minus size={12} />
                            </button>
                            <span className="cart-qty-number">{item.quantity}</span>
                            <button className="cart-qty-btn" onClick={() => updateCartItemQty(idx, item.quantity + 1)} aria-label="Increase quantity">
                              <Plus size={12} />
                            </button>
                          </div>
                          <button className="cart-item-remove" onClick={() => removeCartItem(idx)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-subtotal-row">
                  <span className="subtotal-label">Subtotal</span>
                  <span className="subtotal-value">Rs. {calculateSubtotal().toFixed(2)}</span>
                </div>
                <p className="cart-shipping-notice">
                  {calculateSubtotal() >= 999 
                    ? "🎉 You qualify for FREE shipping!" 
                    : `Add Rs. ${(999 - calculateSubtotal()).toFixed(2)} more for FREE shipping!`}
                </p>
                <button className="btn-checkout" onClick={() => alert('Proceeding to checkout! (Demo purpose)')}>
                  Check out
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Festival Side Notification */}
      {activeFestival && !activeFestival.isDown && isLoggedIn && !festivalNotifDismissed && (
        <div className="festival-side-notification">
          <button className="festival-notif-close" onClick={() => setFestivalNotifDismissed(true)} aria-label="Close notification">
            <X size={16} />
          </button>
          <div className="festival-notif-icon">
            <Gift size={28} color="#d4af37" />
          </div>
          <div className="festival-notif-content" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <span className="festival-name-golden" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{activeFestival.name}</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.4 }}>
              Get <strong>{activeFestival.discountValue}{activeFestival.discountType === 'Percentage (%)' ? '%' : '₹'}</strong> OFF on {activeFestival.applyTo === 'All Products' ? 'all products' : 'selected items'}!
            </p>
            {activeFestival.endDate && (
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                Ends: {new Date(`${activeFestival.endDate}T${activeFestival.endTime || '23:59'}`).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

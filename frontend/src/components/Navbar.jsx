import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, LogOut, Plus, Minus } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const navigate = useNavigate();

  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  // Cart States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

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

  const fetchAllProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/products');
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data);
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

  const navLinks = [
    { name: "Home Page", href: "/" },
    { 
      name: "Bangles", 
      dropdown: [
        { name: "Glass Bangles", href: "/category/glass-bangles" },
        { name: "Baby Shower", href: "/category/baby-shower" },
        { name: "Antique Bangles", href: "/category/antique-bangles" },
        { name: "Combos", href: "/category/combos" },
        { name: "Plus Size Bangles", href: "/category/plus-size-bangles" }
      ]
    },
    { 
      name: "Terracotta Jewellery", 
      dropdown: [
        { name: "Daily wear", href: "/category/daily-wear" },
        { name: "Jumkas", href: "/category/jumkas" },
        { name: "Studs", href: "/category/studs" },
        { name: "Jewellery Set", href: "/category/jewellery-set" },
        { name: "Bridal Set", href: "/category/bridal-set" },
        { name: "Kids wear", href: "/category/kids-wear" }
      ]
    },
    { name: "Organiser", href: "/category/organiser" },
    { name: "Hampers", href: "/category/hampers" },
    { name: "Contact Us", href: "/#contact-us" },
    { name: "About Us", href: "/#about-us" }
  ];

  return (
    <>
      <div className="store-navbar-wrapper">
        {/* Top Banner */}
        <div className="top-banner">
          <p>WELCOME TO OUR STORE — FREE SHIPPING ON ALL ORDERS ABOVE RS. 999!</p>
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
                <Link to="/" className="store-logo-link">
                  <h1 className="store-logo">
                    RaHa <span className="logo-accent">Creations</span>
                  </h1>
                </Link>
              </div>

              {/* Categories Navigation (Desktop Middle) */}
              <div className={`navbar-categories ${isMobileMenuOpen ? 'open' : ''}`}>
                {navLinks.map((link, index) => (
                  link.dropdown ? (
                    <div key={index} className="nav-dropdown-container">
                      <span className="category-link" style={{ cursor: 'pointer' }}>
                        {link.name}
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <div className="nav-dropdown">
                        {link.dropdown.map((subLink, subIndex) => (
                          <Link key={subIndex} to={subLink.href} className="nav-dropdown-item" onClick={() => setIsMobileMenuOpen(false)}>
                            {subLink.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    link.href.startsWith('/#') ? (
                      <a key={index} href={link.href} className="category-link" onClick={() => setIsMobileMenuOpen(false)}>
                        {link.name}
                      </a>
                    ) : (
                      <Link key={index} to={link.href} className="category-link" onClick={() => setIsMobileMenuOpen(false)}>
                        {link.name}
                      </Link>
                    )
                  )
                ))}
                
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
    </>
  );
};

export default Navbar;

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Gift, Star, Heart, Diamond, Gift as GiftIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import gsap from 'gsap';
import API_BASE from '../config/api';
import { getFestivalPrice, isFestivalActive } from '../utils/festivalPrice';

const HomePage = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState({});
  const [activeFestival, setActiveFestival] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Load initially
    const saved = JSON.parse(localStorage.getItem('savedLooks') || '[]');
    const likedMap = {};
    saved.forEach(p => likedMap[p._id] = true);
    setLiked(likedMap);

    // Listen for updates from other tabs/components
    const handleUpdate = () => {
      const updated = JSON.parse(localStorage.getItem('savedLooks') || '[]');
      const updatedMap = {};
      updated.forEach(p => updatedMap[p._id] = true);
      setLiked(updatedMap);
    };
    window.addEventListener('savedLooksUpdated', handleUpdate);
    return () => window.removeEventListener('savedLooksUpdated', handleUpdate);
  }, []); // local liked state

  const heroRef = useRef(null);

  useEffect(() => {
    // GSAP Animation for Hero Section
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-tag', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' });
      gsap.fromTo('.hero-title span', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, delay: 0.4, ease: 'power3.out' });
      gsap.fromTo('.hero-title-divider', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.6, ease: 'power3.out' });
      gsap.fromTo('.hero-desc', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.8, ease: 'power3.out' });
      gsap.fromTo('.hero-actions > *', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 1, ease: 'power3.out' });
      gsap.fromTo('.hero-features-new .feature-item', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 1.2, ease: 'power3.out' });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setPopularProducts(data.filter(p => p.isPopular).slice(0, 20));
          }
        }
      } catch (err) {
        console.error('Error fetching popular products:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchActiveFestival = async () => {
      try {
        const res = await fetch(`${API_BASE}/festivals/active`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.featureOnHome && isFestivalActive(data)) {
            setActiveFestival(data);
          }
        }
      } catch (err) {
        console.error('Error fetching active festival:', err);
      }
    };

    fetchPopularProducts();
    fetchActiveFestival();
  }, []);

  // Festival banner logic has been moved to FestivalOfferPage

  const toggleLike = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const saved = JSON.parse(localStorage.getItem('savedLooks') || '[]');
    const exists = saved.find(p => p._id === product._id);
    let updated;
    if (exists) {
      updated = saved.filter(p => p._id !== product._id);
    } else {
      updated = [...saved, product];
    }
    localStorage.setItem('savedLooks', JSON.stringify(updated));
    window.dispatchEvent(new Event('savedLooksUpdated'));
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const card = e.target.closest('.product-card');
    if (!card) {
      console.log("No product card found");
      return;
    }
    
    const imgElement = card.querySelector('.product-image');
    if (!imgElement) {
      console.log("No product image found");
      return;
    }
    
    // Find the visible cart icon
    const cartIcons = document.querySelectorAll('[aria-label="Shopping bag"]');
    let targetCartIcon = null;
    for (const icon of cartIcons) {
      const rect = icon.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        targetCartIcon = icon;
        break;
      }
    }
    
    if (!targetCartIcon) {
      console.log("No visible cart icon found");
      return;
    }
    console.log("Found cart icon", targetCartIcon);
    
    const imgRect = imgElement.getBoundingClientRect();
    const cartRect = targetCartIcon.getBoundingClientRect();
    
    const clone = imgElement.cloneNode(true);
    
    Object.assign(clone.style, {
      position: 'fixed',
      top: `${imgRect.top}px`,
      left: `${imgRect.left}px`,
      width: `${imgRect.width}px`,
      height: `${imgRect.height}px`,
      objectFit: 'cover',
      borderRadius: window.getComputedStyle(imgElement).borderRadius,
      zIndex: 9999,
      pointerEvents: 'none',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
    });
    
    document.body.appendChild(clone);
    
    gsap.to(clone, {
      top: cartRect.top + (cartRect.height / 2) - 10,
      left: cartRect.left + (cartRect.width / 2) - 10,
      width: 20,
      height: 20,
      opacity: 0.5,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        clone.remove();
        
        // Update actual cart state
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const unitPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
        const selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free Size';
        const selectedColor = product.colors && product.colors.length > 0 ? product.colors[0] : 'Default';
        
        const existingIndex = currentCart.findIndex(
          item => item._id === product._id && item.size === selectedSize && item.color === selectedColor
        );
        
        if (existingIndex > -1) {
          currentCart[existingIndex].quantity += 1;
        } else {
          currentCart.push({
            _id: product._id,
            name: product.name,
            price: unitPrice,
            image: product.images[0] || 'https://via.placeholder.com/300',
            size: selectedSize,
            color: selectedColor,
            quantity: 1
          });
        }
        
        localStorage.setItem('cart', JSON.stringify(currentCart));
        window.dispatchEvent(new Event('cartUpdated'));

        gsap.to(targetCartIcon, {
          scale: 1.2,
          duration: 0.1,
          yoyo: true,
          repeat: 1
        });
      }
    });
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* Modern Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div 
          className="hero-container" 
          style={{ 
            backgroundImage: `url('/hero-bg.png')`
          }}
        >
          <div className="hero-content">
            <div className="hero-tag-wrapper">
              {/* Mandala Icon */}
              <svg className="hero-mandala" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cb8d71" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20M12 2a4 4 0 0 0-4 4 4 4 0 0 0 4 4M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4M2 12a4 4 0 0 0 4-4 4 4 0 0 0 4 4M2 12a4 4 0 0 1 4 4 4 4 0 0 1-4-4M12 22a4 4 0 0 0-4-4 4 4 0 0 0 4-4M12 22a4 4 0 0 1 4-4 4 4 0 0 1-4-4M22 12a4 4 0 0 0-4-4 4 4 0 0 0-4 4M22 12a4 4 0 0 1-4 4 4 4 0 0 1-4 4" />
              </svg>
              
              <div className="hero-tag">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea6c65" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-9M12 13a4 4 0 0 0-4-4h-3M12 13a4 4 0 0 1 4-4h3M12 9V4M12 4a3 3 0 0 0-3 3v2M12 4a3 3 0 0 1 3 3v2"/></svg>
                <span style={{ color: '#ea6c65', fontWeight: 600, letterSpacing: '0.1em', fontSize: '0.875rem' }}>HANDCRAFTED WITH LOVE</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea6c65" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}><path d="M12 22v-9M12 13a4 4 0 0 0-4-4h-3M12 13a4 4 0 0 1 4-4h3M12 9V4M12 4a3 3 0 0 0-3 3v2M12 4a3 3 0 0 1 3 3v2"/></svg>
              </div>
            </div>

            <h1 className="hero-title" style={{ fontFamily: 'var(--font-secondary)', color: '#0e1f33', textAlign: 'left', lineHeight: 1.2, width: '100%', marginBottom: '0.5rem' }}>
              <span>Crafted Traditions,</span>
              <span style={{ display: 'block' }}>Worn <em style={{ color: '#d67953', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 'normal' }}>Beautifully</em></span>
            </h1>
            
            <div className="hero-title-divider" style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', width: '100%' }}>
              <span style={{ height: '1px', backgroundColor: '#d5b272', width: '80px', display: 'inline-block' }}></span>
              <span style={{ color: '#d5b272', fontSize: '1rem', margin: '0 0.5rem' }}>❖</span>
              <span style={{ height: '1px', backgroundColor: '#d5b272', width: '30px', display: 'inline-block' }}></span>
            </div>
            
            <p className="hero-desc" style={{ color: '#506e7a', textAlign: 'left', width: '100%' }}>
              Handcrafted bangles, terracotta jewellery, and personalized creations made to celebrate every moment.
            </p>
            
            <div className="hero-actions">
              <Link to="/category/glass-bangles" className="btn btn-dark-hero">
                Popular Picks <ArrowRight size={16} />
              </Link>
              <Link to="/about" className="btn btn-outline-hero">
                About Us
              </Link>
            </div>
            
            <div className="hero-features-new" style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div className="feature-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef0e7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Heart size={18} color="#e07a5f" />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#0e1f33', fontWeight: 500, lineHeight: 1.2 }}>Handmade<br/>with love</div>
                </div>
                
                <div style={{ width: '1px', height: '30px', backgroundColor: '#e2d4cb', margin: '0 1rem' }}></div>
                
                <div className="feature-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef0e7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e07a5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/></svg>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#0e1f33', fontWeight: 500, lineHeight: 1.2 }}>Premium<br/>quality</div>
                </div>
              </div>
              
              <div className="feature-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef0e7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Gift size={18} color="#e07a5f" />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#0e1f33', fontWeight: 500, lineHeight: 1.2 }}>Perfect for<br/>every occasion</div>
              </div>
            </div>
          </div>
          {/* Hero image is now handled by CSS background */}
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="shop-by-category-section">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Explore our exclusive range of handcrafted products and thoughtful services.</p>
          <div className="section-underline"></div>
        </div>

        <div className="category-groups-container">
          {/* Products Group */}
          <div className="category-group-box">
            <div className="group-header">
              <div className="group-icon-wrapper products-icon">
                <ShoppingBag size={20} />
              </div>
              <div className="group-header-text">
                <h3 className="group-title">Products</h3>
                <p className="group-subtitle">Handcrafted with love, made for you.</p>
              </div>
            </div>
            <div className="group-cards-grid">
              {/* Card 1: Bangles */}
              <div className="category-horizontal-card">
                <div className="card-image-container">
                  <img src="/thanvi-glass-bangles.jpg" alt="Bangles" className="card-image" />
                </div>
                <div className="card-details-container">
                  <h4 className="card-title">Bangles</h4>
                  <p className="card-description">Elegant glass bangles in a variety of colors and designs.</p>
                  <Link to="/category/glass-bangles" className="explore-link link-bangles">
                    Explore Bangles <span className="arrow">→</span>
                  </Link>
                </div>
              </div>

              {/* Card 2: Terracotta Jewellery */}
              <div className="category-horizontal-card">
                <div className="card-image-container">
                  <img 
                    src="https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=600&q=80" 
                    alt="Terracotta Jewellery" 
                    className="card-image" 
                  />
                </div>
                <div className="card-details-container">
                  <h4 className="card-title">Terracotta Jewellery</h4>
                  <p className="card-description">Unique, lightweight terracotta jewellery for every occasion.</p>
                  <Link to="/category/daily-wear" className="explore-link link-terracotta">
                    Explore Terracotta Jewellery <span className="arrow">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Services Group */}
          <div className="category-group-box">
            <div className="group-header">
              <div className="group-icon-wrapper services-icon">
                <Gift size={20} />
              </div>
              <div className="group-header-text">
                <h3 className="group-title">Services</h3>
                <p className="group-subtitle">Curated solutions to make every moment special.</p>
              </div>
            </div>
            <div className="group-cards-grid">
              {/* Card 1: Organisers & Decors */}
              <div className="category-horizontal-card">
                <div className="card-image-container">
                  <img 
                    src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80" 
                    alt="Organisers & Decors" 
                    className="card-image" 
                  />
                </div>
                <div className="card-details-container">
                  <h4 className="card-title">Organisers & Decors</h4>
                  <p className="card-description">Stylish and functional organisers and decors to elevate your space.</p>
                  <Link to="/category/organiser" className="explore-link link-organisers">
                    Explore Organisers & Decors <span className="arrow">→</span>
                  </Link>
                </div>
              </div>

              {/* Card 2: Gift Hampers */}
              <div className="category-horizontal-card">
                <div className="card-image-container">
                  <img 
                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80" 
                    alt="Gift Hampers" 
                    className="card-image" 
                  />
                </div>
                <div className="card-details-container">
                  <h4 className="card-title">Gift Hampers</h4>
                  <p className="card-description">Thoughtfully curated gift hampers for every celebration.</p>
                  <Link to="/category/hampers" className="explore-link link-hampers">
                    Explore Gift Hampers <span className="arrow">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Picks Section */}
      <section className="popular-picks-section">
        <div className="section-header">
          <h2 className="section-title">Popular Picks</h2>
          <div className="section-underline"></div>
        </div>

        {loading ? (
          <div className="catalog-loading">
            <div className="spinner"></div>
            <p>Loading popular picks...</p>
          </div>
        ) : (
          <div className="popular-products-grid">
            {popularProducts.map((product) => (
              <Link key={product._id} to={`/product/${product._id}`} className="product-card">
                <div className="product-image-wrapper">
                  <img 
                    src={product.images[0] || 'https://via.placeholder.com/300'} 
                    alt={product.name} 
                    className="product-image"
                  />
                  {/* Heart icon */}
                  <div className="heart-btn" onClick={e => toggleLike(e, product)}>
                    <Heart size={18} fill={liked[product._id] ? "#e11d48" : "none"} color={liked[product._id] ? "#e11d48" : "#4b5563"} />
                  </div>
                  {product.isOnSale && (
                    <span className="product-sale-badge">Sale</span>
                  )}
                  {product.color && (
                    <span className="product-color-badge">{product.color}</span>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price-row">
                    {(() => {
                      const festivalDiscounted = activeFestival ? getFestivalPrice(product.price, activeFestival) : null;
                      if (festivalDiscounted !== null && festivalDiscounted < product.price) {
                        return (
                          <>
                            <span className="sale-price">₹{festivalDiscounted.toFixed(2)}</span>
                            <span className="original-price">₹{product.price.toFixed(2)}</span>
                          </>
                        );
                      } else if (product.isOnSale && product.salePrice) {
                        return (
                          <>
                            <span className="sale-price">₹{product.salePrice.toFixed(2)}</span>
                            <span className="original-price">₹{product.price.toFixed(2)}</span>
                          </>
                        );
                      } else {
                        return <span className="sale-price">₹{product.price.toFixed(2)}</span>;
                      }
                    })()}
                  </div>
                  <div className="product-card-ratings">
                    <div className="stars">
                      {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />)}
                    </div>
                    <span className="review-count" style={{ fontSize: '0.75rem', color: '#6b7280' }}>(112)</span>
                  </div>
                  <div className="product-card-actions">
                    <button className="btn-card btn-card-outline" onClick={(e) => handleAddToCart(e, product)}>Add to Cart</button>
                    <button className="btn-card btn-card-outline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>Shop Now</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;

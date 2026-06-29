import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API_BASE from '../config/api';
import { isFestivalActive, getFestivalPrice } from '../utils/festivalPrice';
import { Heart, Star } from 'lucide-react';
import gsap from 'gsap';

const FestivalOfferPage = () => {
  const [festival, setFestival] = useState(null);
  const [festivalProducts, setFestivalProducts] = useState([]);
  const [festivalCategories, setFestivalCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [liked, setLiked] = useState({});

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedLooks') || '[]');
    const likedMap = {};
    saved.forEach(p => likedMap[p._id] = true);
    setLiked(likedMap);

    const handleUpdate = () => {
      const updated = JSON.parse(localStorage.getItem('savedLooks') || '[]');
      const updatedMap = {};
      updated.forEach(p => updatedMap[p._id] = true);
      setLiked(updatedMap);
    };
    window.addEventListener('savedLooksUpdated', handleUpdate);
    return () => window.removeEventListener('savedLooksUpdated', handleUpdate);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const festivalRes = await fetch(`${API_BASE}/festivals/active`);
        if (festivalRes.ok) {
          const data = await festivalRes.json();
          setFestival(data);

          if (data) {
            if (data.applyTo === 'All Products' || data.applyTo === 'Specific Products') {
              const productsRes = await fetch(`${API_BASE}/products`);
              if (productsRes.ok) {
                const pData = await productsRes.json();
                if (data.applyTo === 'All Products') {
                  setFestivalProducts(pData);
                } else {
                  setFestivalProducts(pData.filter(p => data.products.includes(p._id)));
                }
              }
            } else if (data.applyTo === 'Specific Categories') {
              const catRes = await fetch(`${API_BASE}/categories`);
              if (catRes.ok) {
                const cData = await catRes.json();
                setFestivalCategories(cData.filter(c => data.categories.includes(c._id)));
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching festival offer data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    
    // Stock validation BEFORE animating
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free Size';
    const selectedColor = product.colors && product.colors.length > 0 ? product.colors[0] : 'Default';
    
    const existingIndex = currentCart.findIndex(
      item => item._id === product._id && item.size === selectedSize && item.color === selectedColor
    );
    
    if (existingIndex > -1) {
      const prospectiveQty = currentCart[existingIndex].quantity + 1;
      if (product && prospectiveQty > product.stock) {
        alert(`Only ${product.stock} units are available in stock. You already have ${currentCart[existingIndex].quantity} in your cart.`);
        return;
      }
    } else {
      if (product && product.stock <= 0) {
        alert("This product is currently out of stock.");
        return;
      }
    }

    const card = e.target.closest('.product-card');
    if (!card) return;
    
    const imgElement = card.querySelector('.product-image');
    if (!imgElement) return;
    
    const cartIcons = document.querySelectorAll('[aria-label="Shopping bag"]');
    let targetCartIcon = null;
    for (const icon of cartIcons) {
      const rect = icon.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        targetCartIcon = icon;
        break;
      }
    }
    
    if (!targetCartIcon) return;
    
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
        
        const unitPrice = festival ? getFestivalPrice(product.price, festival) || product.price : product.price;
        
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
            quantity: 1,
            stock: product.stock
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

  if (loading) {
    return (
      <div className="festival-offer-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px 20px', fontSize: '1.2rem', color: '#64748b' }}>
          Loading festival offers...
        </div>
        <Footer />
      </div>
    );
  }

  if (!festival || !isFestivalActive(festival)) {
    return (
      <div className="festival-offer-page">
        <Navbar />
        <div className="expired-offer-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '1rem' }}>Offer Expired</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            We're sorry, this festival offer has ended or is currently unavailable. Please check back later for exciting new discounts!
          </p>
          <Link to="/home" className="btn btn-dark-hero" style={{ marginTop: '2rem', display: 'inline-block' }}>Return Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (festival.isDown) {
    return (
      <div className="festival-offer-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '1rem', fontFamily: "'Poppins', sans-serif" }}>
              {festival.name} is Temporarily Unavailable
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" }}>
              This offer is currently being updated. We'll be back with exciting deals very soon — stay tuned!
            </p>
            <Link to="/home" style={{ display: 'inline-block', marginTop: '2rem', padding: '0.65rem 2rem', background: '#0f172a', color: '#fff', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', fontFamily: "'Poppins', sans-serif" }}>Return Home</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const renderProducts = (productsToRender) => {
    if (!productsToRender || productsToRender.length === 0) {
      return <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No products found for this offer.</div>;
    }

    return (
      <div className="product-grid" style={{ padding: '0 2rem 4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {productsToRender.map(product => (
          <Link key={product._id} to={`/product/${product._id}`} className="product-card">
            <div className="product-image-wrapper">
              <img src={product.images[0] || 'https://via.placeholder.com/300'} alt={product.name} className="product-image" />
              <button className="btn-wishlist" onClick={(e) => toggleLike(e, product)}>
                <Heart size={18} fill={liked[product._id] ? "#e11d48" : "none"} color={liked[product._id] ? "#e11d48" : "#4b5563"} />
              </button>
              <span className="product-sale-badge" style={{ backgroundColor: '#d4af37' }}>
                {festival.discountValue}{festival.discountType === 'Percentage (%)' ? '%' : '₹'} OFF
              </span>
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <div className="product-price-row">
                {(() => {
                  const festivalDiscounted = getFestivalPrice(product.price, festival);
                  if (festivalDiscounted !== null && festivalDiscounted < product.price) {
                    return (
                      <>
                        <span className="sale-price">₹{festivalDiscounted.toFixed(2)}</span>
                        <span className="original-price">₹{product.price.toFixed(2)}</span>
                      </>
                    );
                  }
                  return <span className="sale-price">₹{product.price.toFixed(2)}</span>;
                })()}
              </div>
              <div className="product-card-ratings">
                <div className="stars">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />)}
                </div>
              </div>
              <div className="product-card-actions">
                <button className="btn-card btn-card-outline" onClick={(e) => handleAddToCart(e, product)}>Add to Cart</button>
                <button className="btn-card btn-card-outline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>Shop Now</button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const bannerImgUrl = isMobile && festival.mobileBannerUrl 
    ? festival.mobileBannerUrl 
    : (festival.desktopBannerUrl || festival.mobileBannerUrl);

  const formatCategorySlug = (catName) => {
    return catName.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="festival-offer-page">
      <Navbar />
      
      <main className="festival-main">
        {/* Banner Section */}
        {bannerImgUrl && (
          <div className="festival-banner-wrapper">
            <img 
              src={bannerImgUrl} 
              alt={festival.name} 
              className="festival-banner-img"
            />
            {festival.showBadge && festival.bannerText && (
              <div className="festival-banner-badge">
                {festival.bannerText}
              </div>
            )}
          </div>
        )}

        {/* Section Header */}
        <div className="section-header" style={{ marginTop: '3rem' }}>
          <h2 className="section-title">
            {festival.applyTo === 'Specific Categories' ? 'Eligible Categories' : 'Eligible Products'}
          </h2>
          <p className="section-subtitle">
            {festival.applyTo === 'Specific Categories' 
              ? 'Select a category below to explore the discounted items.'
              : 'Shop the products currently on offer during this festival.'}
          </p>
          <div className="section-underline"></div>
        </div>
        
        {/* Categories Grid */}
        {festival.applyTo === 'Specific Categories' && (
          <div className="offer-category-grid">
            {festivalCategories && festivalCategories.length > 0 ? (
              festivalCategories.map(cat => (
                <Link to={`/category/${formatCategorySlug(cat.name)}`} key={cat._id} className="offer-category-card">
                  <div className="offer-category-badge">
                    <span className="badge-value">{festival.discountValue}{festival.discountType === 'Percentage (%)' ? '%' : '₹'}</span>
                    <span className="badge-text">OFF</span>
                  </div>
                  <div className="offer-category-img-wrapper">
                    <img 
                      src={cat.image || 'https://via.placeholder.com/300'} 
                      alt={cat.name} 
                      className="offer-category-img"
                    />
                  </div>
                  <div className="offer-category-info">
                    <h3 className="offer-category-name">{cat.name}</h3>
                    <p className="offer-category-desc">On selected items</p>
                    <span className="offer-category-link">SHOP NOW &rarr;</span>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ textAlign: 'center', width: '100%', color: '#64748b' }}>No categories selected for this offer.</div>
            )}
          </div>
        )}

        {/* Products Grid */}
        {festival.applyTo === 'Specific Products' && renderProducts(festivalProducts)}
        
        {festival.applyTo === 'All Products' && renderProducts(festivalProducts)}

      </main>

      <Footer />
    </div>
  );
};

export default FestivalOfferPage;

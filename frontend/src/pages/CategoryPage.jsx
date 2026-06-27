import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Star, Heart } from 'lucide-react';
import gsap from 'gsap';
import API_BASE from '../config/api';

const categorySlugMapping = {
  'glass-bangles': 'Glass Bangles',
  'baby-shower': 'Baby Shower',
  'antique-bangles': 'Antique Bangles',
  'combos': 'Combos',
  'plus-size-bangles': 'Plus Size Bangles',
  'daily-wear': 'Daily wear',
  'jumkas': 'Jumkas',
  'studs': 'Studs',
  'jewellery-set': 'Jewellery Set',
  'bridal-set': 'Bridal Set',
  'kids-wear': 'Kids wear',
  'organiser': 'Organiser',
  'hampers': 'Hampers'
};

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(''); // price range filter
  const [sort, setSort] = useState(''); // sort order
  const [liked, setLiked] = useState({}); // local liked state

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
  }, []);

  const categoryName = categorySlugMapping[categorySlug] || categorySlug;

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/products?category=${encodeURIComponent(categoryName)}`);
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryProducts();
    window.scrollTo(0, 0);
  }, [categorySlug, categoryName]);

  // Apply filter
  const filteredProducts = products.filter(p => {
    if (!filter) return true;
    const [min, max] = filter.split('-').map(Number);
    return p.price >= min && p.price <= max;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sort) return 0;
    const [field, dir] = sort.split('-');
    if (field === 'price') {
      return dir === 'asc' ? a.price - b.price : b.price - a.price;
    }
    if (field === 'name') {
      return dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    return 0;
  });

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
    if (!card) return;
    
    const imgElement = card.querySelector('.product-image');
    if (!imgElement) return;
    
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
      zIndex: '9999',
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
    <div className="category-detail-page">
      <Navbar />
      <main className="category-detail-container">
        <div className="category-header">
          <h2 className="category-title">{categoryName}</h2>
        </div>
        {/* Filter & Sort Toolbar */}
        <div className="toolbar">
          <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Prices</option>
            <option value="0-500">0 – 500</option>
            <option value="500-1000">500 – 1000</option>
            <option value="1000-2000">1000 – 2000</option>
          </select>
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="">Sort By</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="name-asc">Name A‑Z</option>
            <option value="name-desc">Name Z‑A</option>
          </select>
        </div>
        {loading ? (
          <div className="catalog-loading"><div className="spinner" />Loading products...</div>
        ) : error ? (
          <div className="catalog-error">Error: {error}</div>
        ) : sortedProducts.length === 0 ? (
          <div className="catalog-empty">No products found.</div>
        ) : (
          <div className="product-grid">
            {sortedProducts.map(product => (
              <Link key={product._id} to={`/product/${product._id}`} className="product-card">
                <div className="product-image-wrapper">
                  <img src={product.images[0] || 'https://via.placeholder.com/300'} alt={product.name} className="product-image" />
                  {/* Heart icon */}
                  <button className="btn-wishlist" onClick={(e) => toggleLike(e, product)}>
                    <Heart size={18} fill={liked[product._id] ? "#e11d48" : "none"} color={liked[product._id] ? "#e11d48" : "#4b5563"} />
                  </button>
                  {product.isOnSale && <span className="product-sale-badge">Sale</span>}
                  {product.color && <span className="product-color-badge">{product.color}</span>}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price-row">
                    {product.isOnSale && product.salePrice ? (
                      <>
                        <span className="sale-price">₹{product.salePrice.toFixed(2)}</span>
                        <span className="original-price">₹{product.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="sale-price">₹{product.price.toFixed(2)}</span>
                    )}
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
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;

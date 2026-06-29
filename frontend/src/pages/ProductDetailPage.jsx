import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Plus, Minus, Star, Truck, Heart, ShoppingCart, Zap, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API_BASE from '../config/api';
import { getFestivalPrice, isFestivalActive } from '../utils/festivalPrice';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Selections
  const [selectedSize, setSelectedSize] = useState('2.4');
  const [selectedColor, setSelectedColor] = useState('maroon');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllImagesGallery, setShowAllImagesGallery] = useState(false);
  const [isClosingGallery, setIsClosingGallery] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeFestival, setActiveFestival] = useState(null);
  const [isExiting, setIsExiting] = useState(false);

  const handleSizeFinderClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/size-finder');
    }, 400);
  };

  // Fetch active festival
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
  }, []);

  // Load saved state on mount
  useEffect(() => {
    if (productId) {
      const savedItems = JSON.parse(localStorage.getItem('savedItems') || '{}');
      if (savedItems[productId]) {
        setIsSaved(true);
      } else {
        setIsSaved(false);
      }
    }
  }, [productId]);

  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      if (!product.sizes.includes(selectedSize)) {
        setSelectedSize(product.sizes[0]);
      }
    } else {
      setSelectedSize(''); // Clear size if product has no sizes
    }
  }, [product, selectedSize]);

  // Mock Data
  const mockColors = [
    { id: 'maroon', hex: '#6b112c' },
    { id: 'green', hex: '#14532d' },
    { id: 'yellow', hex: '#b45309' }
  ];
  const sizes = ['2.2', '2.4', '2.6', '2.8'];
  const disabledSizes = product?.sizes?.length > 0 ? sizes.filter(s => !product.sizes.includes(s)) : sizes;

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/products/${productId}`);
        if (!res.ok) throw new Error('Product not found');
        const productData = await res.json();
        setProduct(productData);

        const relRes = await fetch(`${API_BASE}/products?category=${encodeURIComponent(productData.category)}`);
        if (relRes.ok) {
          const relData = await relRes.json();
          const filtered = relData.filter(item => item._id !== productId).slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
    window.scrollTo(0, 0);
    setQuantity(1);
    setSelectedImageIndex(0);

    const saved = JSON.parse(localStorage.getItem('savedLooks') || '[]');
    setIsSaved(saved.some(p => p._id === productId));

    const handleUpdate = () => {
      const updated = JSON.parse(localStorage.getItem('savedLooks') || '[]');
      setIsSaved(updated.some(p => p._id === productId));
    };
    window.addEventListener('savedLooksUpdated', handleUpdate);
    return () => window.removeEventListener('savedLooksUpdated', handleUpdate);
  }, [productId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const toggleSave = () => {
    if (!product) return;
    const saved = JSON.parse(localStorage.getItem('savedLooks') || '[]');
    let updated;
    if (isSaved) {
      updated = saved.filter(p => p._id !== product._id);
    } else {
      updated = [...saved, product];
    }
    localStorage.setItem('savedLooks', JSON.stringify(updated));
    window.dispatchEvent(new Event('savedLooksUpdated'));
  };

  const incrementQty = () => setQuantity(prev => {
    const available = product.stockMetrics?.available !== undefined ? product.stockMetrics.available : product.stock;
    if (product && prev >= available) {
      alert(`Only ${available} units are available in stock.`);
      return prev;
    }
    return prev + 1;
  });
  const decrementQty = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  const handleAddToCart = () => {
    const available = product.stockMetrics?.available !== undefined ? product.stockMetrics.available : product.stock;
    if (product && available <= 0) {
      alert("This product is currently out of stock.");
      return;
    }

    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const festivalDiscounted = activeFestival && product ? getFestivalPrice(product.price, activeFestival) : null;
    const unitPrice = festivalDiscounted !== null && festivalDiscounted < product.price 
      ? festivalDiscounted 
      : (product.isOnSale && product.salePrice ? product.salePrice : product.price);
    const existingIndex = currentCart.findIndex(
      item => item._id === product._id && item.size === selectedSize && item.color === selectedColor
    );
    
    if (existingIndex > -1) {
      const prospectiveQty = currentCart[existingIndex].quantity + quantity;
      if (product && prospectiveQty > available) {
        alert(`Only ${available} units are available in stock. You already have ${currentCart[existingIndex].quantity} in your cart.`);
        return;
      }
      currentCart[existingIndex].quantity = prospectiveQty;
    } else {
      if (product && quantity > available) {
        alert(`Only ${available} units are available in stock.`);
        return;
      }
      currentCart.push({
        _id: product._id,
        name: product.name,
        price: unitPrice,
        image: product.images[selectedImageIndex] || product.images[0] || 'https://via.placeholder.com/300',
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
        stock: product.stock // Carry stock property for easy checks
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new CustomEvent('openCartDrawer'));
  };

  const handleBuyNow = () => {
    handleAddToCart();
  };

  const handleCloseGallery = (idx = null) => {
    setIsClosingGallery(true);
    if (idx !== null) {
      setSelectedImageIndex(idx);
    }
    setTimeout(() => {
      setShowAllImagesGallery(false);
      setIsClosingGallery(false);
    }, 200);
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="catalog-loading"><div className="spinner"></div><p>Loading product details...</p></div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="catalog-error">
          <p>Error: {error || 'Product not found'}</p>
          <Link to="/home" className="back-to-home" style={{ marginTop: '1rem', display: 'inline-block' }}>&larr; Back to Home Page</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Only show the images the product actually has
  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : ['https://via.placeholder.com/600'];

  return (
    <div className="product-detail-page">
      <Navbar />

      <main className="product-detail-main">
        {/* Breadcrumb */}
        <div className="detail-breadcrumb">
          <Link to="/home" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={`/category/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="breadcrumb-link">
            {product.category}
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>

         <div className="product-detail-layout">
           {/* Left: Image Gallery & Actions */}
           <div className="gallery-and-actions-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div className="product-gallery">
               <div className="thumbnail-list">
                {displayImages.slice(0, 5).map((img, idx) => {
                  const isLastAndMore = idx === 4 && displayImages.length > 5;
                  return (
                    <button 
                      key={idx} 
                      className={`thumbnail-btn ${selectedImageIndex === idx ? 'active' : ''} ${isLastAndMore ? 'view-all-thumbnail' : ''}`}
                      onClick={() => isLastAndMore ? setShowAllImagesGallery(true) : setSelectedImageIndex(idx)}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} />
                      {isLastAndMore && (
                        <div className="view-all-overlay">
                          <span>+{displayImages.length - 4}</span>
                          <span className="view-all-label">View All</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
               <div className="main-image-container">
                 <img src={displayImages[selectedImageIndex]} alt={product.name} className="main-image" />
               </div>
             </div>

             {/* Actions moved under the image gallery */}
             <div className="bottom-actions gallery-actions">
               <div className="action-buttons-row">
                 <button className="btn-add-cart" onClick={handleAddToCart}>
                   <ShoppingCart size={18} /> Add to Cart
                 </button>
                 <button className="btn-shop-now" onClick={handleBuyNow}>
                   <Zap size={18} fill="white" /> Shop Now
                 </button>
               </div>
               
               <button className="save-item-btn" onClick={toggleSave} style={{ marginTop: '1rem' }}>
                 <Heart size={18} fill={isSaved ? "#e91e63" : "none"} color={isSaved ? "#e91e63" : "currentColor"} />
                 <span>{isSaved ? "Saved in looks" : "Save Item"}</span>
               </button>
             </div>
           </div>
 
           {/* Right: Product Details */}
           <div className="product-info-panel">
             <h1 className="product-title">{product.name}</h1>
             
             <div className="product-price">
                {(() => {
                  const festivalDiscounted = activeFestival && product ? getFestivalPrice(product.price, activeFestival) : null;
                  if (festivalDiscounted !== null && festivalDiscounted < product.price) {
                    return (
                      <>
                        <span className="price-sale">₹{festivalDiscounted.toFixed(2)}</span>
                        <span className="price-original">₹{product.price.toFixed(2)}</span>
                      </>
                    );
                  } else if (product.isOnSale && product.salePrice) {
                    return (
                      <>
                        <span className="price-sale">₹{product.salePrice.toFixed(2)}</span>
                        <span className="price-original">₹{product.price.toFixed(2)}</span>
                      </>
                    );
                  } else {
                    return <span className="price-sale">₹{product.price.toFixed(2)}</span>;
                  }
                })()}
              </div>
 
             <div className="product-ratings">
               <div className="stars">
                 {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />)}
               </div>
               <span className="rating-score">4.9</span>
               <span className="review-count">(128 Reviews)</span>
             </div>
 
             <p className="product-description">
               {product.description || 'Hand-painted traditional terracotta bangles with floral clay motifs. Light weight and perfect for everyday grace.'}
             </p>
 
             {/* Size Selector */}
             <div className="selector-section">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                 <span className="selector-label" style={{ marginBottom: 0 }}><strong>Size</strong> (Select your size)</span>
                 {product?.category?.toLowerCase().includes('bangle') && (
                   <button 
                     onClick={handleSizeFinderClick}
                     className="btn-confused-shine"
                   >
                     Confused? Click me!!
                   </button>
                 )}
               </div>
               <div className="size-options">
                 {sizes.map((size) => (
                   <button 
                     key={size}
                     disabled={disabledSizes.includes(size)}
                     className={`size-btn ${selectedSize === size ? 'active' : ''} ${disabledSizes.includes(size) ? 'disabled' : ''}`}
                     onClick={() => setSelectedSize(size)}
                   >
                     {size}
                   </button>
                 ))}
               </div>
             </div>
 
             {/* Color Selector */}
             <div className="selector-section">
               <span className="selector-label"><strong>Color</strong></span>
               <div className="color-options">
                 {mockColors.map((color) => (
                   <button
                     key={color.id}
                     className={`color-btn ${selectedColor === color.id ? 'active' : ''}`}
                     style={{ backgroundColor: color.hex }}
                     onClick={() => setSelectedColor(color.id)}
                     aria-label={`Select color ${color.id}`}
                   />
                 ))}
               </div>
             </div>
 
             {/* Quantity */}
             <div className="selector-section">
               <span className="selector-label"><strong>Quantity</strong></span>
               <div className="quantity-control">
                 <button onClick={decrementQty}><Minus size={16} /></button>
                 <span>{quantity}</span>
                 <button onClick={incrementQty}><Plus size={16} /></button>
               </div>
               {/* Stock Warning */}
               {(() => {
                 const available = product.stockMetrics?.available !== undefined ? product.stockMetrics.available : product.stock;
                 if (available === 1) {
                   return (
                     <div style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.75rem', fontSize: '0.875rem' }}>
                       <span>⚠️ Only 1 item left in stock</span>
                     </div>
                   );
                 } else if (available > 1 && available <= 3) {
                   return (
                     <div style={{ color: '#a16207', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.75rem', fontSize: '0.875rem' }}>
                       <span>Only {available} left</span>
                     </div>
                   );
                 }
                 return null;
               })()}
             </div>
 
             <div className="delivery-info">
               <Truck size={18} />
               <span>Estimated Delivery: 2 - 4 Days</span>
             </div>
           </div>
         </div>

      </main>
      
      {/* Full Gallery Modal */}
      {showAllImagesGallery && (
        <div className={`image-gallery-modal ${isClosingGallery ? 'closing' : ''}`} onClick={() => handleCloseGallery()}>
          <div className="image-gallery-content" onClick={e => e.stopPropagation()}>
            <button className="close-gallery-btn" onClick={() => handleCloseGallery()}>
              <X size={18} />
            </button>
            <h2>All Product Images</h2>
            <div className="full-gallery-grid">
              {displayImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`gallery-grid-item ${selectedImageIndex === idx ? 'active' : ''}`}
                  onClick={() => handleCloseGallery(idx)}
                >
                  <img src={img} alt={`Gallery ${idx}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />

      <AnimatePresence>
        {isExiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: '#FAFAFA',
              zIndex: 9999
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;

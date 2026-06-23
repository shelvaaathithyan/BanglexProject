import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Share2, Plus, Minus, Star, Truck, Heart, ShoppingCart, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { mockProducts } from '../utils/mockProducts';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Selections
  const [selectedSize, setSelectedSize] = useState('2.4');
  const [selectedColor, setSelectedColor] = useState('maroon');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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

  // Mock Data
  const mockColors = [
    { id: 'maroon', hex: '#6b112c' },
    { id: 'green', hex: '#14532d' },
    { id: 'yellow', hex: '#b45309' }
  ];
  const sizes = ['2.2', '2.4', '2.6', '2.8'];
  const disabledSizes = ['2.8'];

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      setError(null);
      try {
        if (productId && productId.startsWith('mock-')) {
          const productData = mockProducts.find(item => item._id === productId);
          if (!productData) throw new Error('Product not found');
          setProduct(productData);
          
          const filtered = mockProducts
            .filter(item => item.category === productData.category && item._id !== productId)
            .slice(0, 4);
          setRelatedProducts(filtered);
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:5000/products/${productId}`);
        if (!res.ok) throw new Error('Product not found');
        const productData = await res.json();
        setProduct(productData);

        const relRes = await fetch(`http://localhost:5000/products?category=${encodeURIComponent(productData.category)}`);
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

  const incrementQty = () => setQuantity(prev => prev + 1);
  const decrementQty = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  const handleAddToCart = () => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const unitPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
    const existingIndex = currentCart.findIndex(
      item => item._id === product._id && item.size === selectedSize && item.color === selectedColor
    );
    
    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += quantity;
    } else {
      currentCart.push({
        _id: product._id,
        name: product.name,
        price: unitPrice,
        image: product.images[selectedImageIndex] || product.images[0] || 'https://via.placeholder.com/300',
        size: selectedSize,
        color: selectedColor,
        quantity: quantity
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new CustomEvent('openCartDrawer'));
  };

  const handleBuyNow = () => {
    handleAddToCart();
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
          <Link to="/" className="back-to-home" style={{ marginTop: '1rem', display: 'inline-block' }}>&larr; Back to Home Page</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Generate a mock array of images if product only has 1, just for the gallery demo
  const displayImages = product.images.length > 1 ? product.images : [
    product.images[0] || 'https://via.placeholder.com/600',
    'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80'
  ];

  return (
    <div className="product-detail-page">
      <Navbar />

      <main className="product-detail-main">
        {/* Breadcrumb */}
        <div className="detail-breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={`/category/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="breadcrumb-link">
            {product.category}
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>

        <div className="product-detail-layout">
          {/* Left: Image Gallery */}
          <div className="product-gallery">
            <div className="thumbnail-list">
              {displayImages.map((img, idx) => (
                <button 
                  key={idx} 
                  className={`thumbnail-btn ${selectedImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(idx)}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} />
                </button>
              ))}
            </div>
            <div className="main-image-container">
              <img src={displayImages[selectedImageIndex]} alt={product.name} className="main-image" />
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="product-info-panel">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-price">
              {product.isOnSale && product.salePrice ? (
                <>
                  <span className="price-sale">₹{product.salePrice.toFixed(2)}</span>
                  <span className="price-original">₹{product.price.toFixed(2)}</span>
                </>
              ) : (
                <span className="price-sale">₹{product.price.toFixed(2)}</span>
              )}
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
              <span className="selector-label"><strong>Size</strong> (Select your size)</span>
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
            </div>

            <div className="delivery-info">
              <Truck size={18} />
              <span>Estimated Delivery: 2 - 4 Days</span>
            </div>

            <hr className="divider-line" />

            {/* Actions */}
            <div className="bottom-actions">
              <button className="save-item-btn" onClick={toggleSave}>
                <Heart size={18} fill={isSaved ? "#e91e63" : "none"} color={isSaved ? "#e91e63" : "currentColor"} />
                <span>{isSaved ? "Saved" : "Save Item"}</span>
              </button>
              
              <div className="action-buttons-row">
                <button className="btn-add-cart" onClick={handleAddToCart}>
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button className="btn-shop-now" onClick={handleBuyNow}>
                  <Zap size={18} fill="white" /> Shop Now
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;

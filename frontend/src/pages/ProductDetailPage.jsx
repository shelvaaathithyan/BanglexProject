import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Share2, Plus, Minus } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState('2.4');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch current product details
        const res = await fetch(`http://localhost:5000/products/${productId}`);
        if (!res.ok) {
          throw new Error('Product not found');
        }
        const productData = await res.json();
        setProduct(productData);

        // Fetch related products from the same category
        const relRes = await fetch(`http://localhost:5000/products?category=${encodeURIComponent(productData.category)}`);
        if (relRes.ok) {
          const relData = await relRes.json();
          // Filter out current product and limit to 4 related products
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
    // Scroll to top when productId changes
    window.scrollTo(0, 0);
    setQuantity(1); // Reset quantity to 1
  }, [productId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const incrementQty = () => setQuantity(prev => prev + 1);
  const decrementQty = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  const handleAddToCart = () => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const unitPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
    const existingIndex = currentCart.findIndex(
      item => item._id === product._id && item.size === selectedSize
    );
    
    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += quantity;
    } else {
      currentCart.push({
        _id: product._id,
        name: product.name,
        price: unitPrice,
        image: product.images[0] || 'https://via.placeholder.com/300',
        size: selectedSize,
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
        <div className="catalog-loading">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
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
          <Link to="/" className="back-to-home" style={{ marginTop: '1rem', display: 'inline-block' }}>
            &larr; Back to Home Page
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <Navbar />

      <main className="product-detail-main">
        {/* Breadcrumb / Back Link */}
        <div className="detail-breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={`/category/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="breadcrumb-link">
            {product.category}
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>

        {/* Product Grid Layout */}
        <div className="product-detail-grid">
          {/* Left Column: Image */}
          <div className="product-detail-image-sec">
            <div className="detail-image-wrapper">
              <img 
                src={product.images[0] || 'https://via.placeholder.com/600'} 
                alt={product.name} 
                className="detail-product-image"
              />
            </div>
          </div>

          {/* Right Column: Information */}
          <div className="product-detail-info-sec">
            <span className="detail-vendor-category">{product.category} Collection</span>
            <h2 className="detail-product-title">{product.name}</h2>

            <div className="detail-price-row">
              {product.isOnSale && product.salePrice ? (
                <>
                  <span className="detail-original-price">Rs. {product.price.toFixed(2)}</span>
                  <span className="detail-sale-price">Rs. {product.salePrice.toFixed(2)}</span>
                  <span className="detail-sale-badge">Sale</span>
                </>
              ) : (
                <span className="detail-sale-price">Rs. {product.price.toFixed(2)}</span>
              )}
            </div>

            <span className="detail-shipping-notice">Shipping calculated at checkout.</span>

            {/* Size Selector */}
            <div className="detail-selector-group">
              <span className="selector-label">Size</span>
              <div className="size-options">
                {['2.4', '2.6', '2.8'].map((size) => (
                  <button 
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="detail-selector-group">
              <span className="selector-label">Quantity</span>
              <div className="quantity-adjuster">
                <button className="qty-btn" onClick={decrementQty} aria-label="Decrease quantity">
                  <Minus size={16} />
                </button>
                <span className="qty-number">{quantity}</span>
                <button className="qty-btn" onClick={incrementQty} aria-label="Increase quantity">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="detail-actions">
              <button className="add-to-cart-btn" onClick={handleAddToCart}>Add to cart</button>
              <button className="buy-now-btn" onClick={handleBuyNow}>Buy it now</button>
            </div>

            {/* Product Description */}
            <div className="detail-description">
              <p>{product.description || 'No description available for this handcrafted masterpiece.'}</p>
            </div>

            {/* Share Link */}
            <div className="detail-share-container">
              <button className="share-btn" onClick={handleShare}>
                <Share2 size={16} />
                <span>{shareSuccess ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <section className="related-products-section">
            <h3 className="related-section-title">You may also like</h3>
            <div className="related-products-grid">
              {relatedProducts.map((relProduct) => (
                <Link key={relProduct._id} to={`/product/${relProduct._id}`} className="product-card">
                  <div className="product-image-wrapper">
                    <img 
                      src={relProduct.images[0] || 'https://via.placeholder.com/300'} 
                      alt={relProduct.name} 
                      className="product-image"
                    />
                    {relProduct.isOnSale && (
                      <span className="product-sale-badge">Sale</span>
                    )}
                    {relProduct.color && (
                      <span className="product-color-badge">{relProduct.color}</span>
                    )}
                  </div>
                  <div className="product-info">
                    <h4 className="product-name">{relProduct.name}</h4>
                    <div className="product-price-row">
                      {relProduct.isOnSale && relProduct.salePrice ? (
                        <>
                          <span className="original-price">Rs. {relProduct.price.toFixed(2)}</span>
                          <span className="sale-price">Rs. {relProduct.salePrice.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="sale-price">Rs. {relProduct.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;

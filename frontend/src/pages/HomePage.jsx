import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Gift } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { mockProducts } from '../utils/mockProducts';

const HomePage = () => {
  const [popularProducts, setPopularProducts] = useState(mockProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/products');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // We want around 20 products. If we get them, use them. If less than 20, fill with mock products.
            let productsToShow = [...data];
            if (productsToShow.length < 20) {
              const extraNeeded = 20 - productsToShow.length;
              productsToShow = [...productsToShow, ...mockProducts.slice(0, extraNeeded)];
            } else {
              productsToShow = productsToShow.slice(0, 20);
            }
            setPopularProducts(productsToShow);
          }
        }
      } catch (err) {
        console.error('Error fetching popular products:', err);
        // Fall back to mockProducts on error
        setPopularProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  return (
    <div className="home-page">
      <Navbar />

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
                    {product.isOnSale && product.salePrice ? (
                      <>
                        <span className="original-price">Rs. {product.price.toFixed(2)}</span>
                        <span className="sale-price">Rs. {product.salePrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="sale-price">Rs. {product.price.toFixed(2)}</span>
                    )}
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

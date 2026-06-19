import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const categoryOrder = [
  'Glass Bangles',
  'Baby Shower',
  'Antique Bangles',
  'Combos',
  'Plus Size Bangles',
  'Daily wear',
  'Jumkas',
  'Studs',
  'Jewellery Set',
  'Bridal Set',
  'Kids wear',
  'Organiser',
  'Hampers'
];

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const HomePage = () => {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/products');
        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await res.json();
        
        // Group products by category
        const grouped = data.reduce((acc, product) => {
          const cat = product.category;
          if (!acc[cat]) {
            acc[cat] = [];
          }
          acc[cat].push(product);
          return acc;
        }, {});
        
        setProductsByCategory(grouped);
      } catch (err) {
        console.error('Error loading products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  return (
    <div className="home-page">
      <Navbar />
      

      {/* Catalog Main Area */}
      <main className="home-main-content">
        {loading ? (
          <div className="catalog-loading">
            <div className="spinner"></div>
            <p>Loading catalog...</p>
          </div>
        ) : error ? (
          <div className="catalog-error">
            <p>Failed to load products: {error}</p>
          </div>
        ) : (
          categoryOrder.map((catName) => {
            const categoryProducts = productsByCategory[catName] || [];
            if (categoryProducts.length === 0) return null;

            // Display top 5 products as requested
            const displayProducts = categoryProducts.slice(0, 5);
            const categorySlug = slugify(catName);

            return (
              <section key={catName} className="home-category-section">
                <div className="category-section-header">
                  <h2 className="category-section-title">{catName}</h2>
                </div>

                <div className="product-row-container">
                  <div className="product-row">
                    {displayProducts.map((product) => (
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
                </div>

                <div className="view-all-container">
                  <Link to={`/category/${categorySlug}`} className="view-all-btn">
                    View all
                  </Link>
                </div>
              </section>
            );
          })
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;

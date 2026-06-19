import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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

  const categoryName = categorySlugMapping[categorySlug] || categorySlug;

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/products?category=${encodeURIComponent(categoryName)}`);
        if (!res.ok) {
          throw new Error('Failed to load products');
        }
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
    // Scroll to top when category changes
    window.scrollTo(0, 0);
  }, [categorySlug, categoryName]);

  return (
    <div className="category-detail-page">
      <Navbar />
      
      <main className="category-detail-container">
        <div className="category-header">
          <h2 className="category-title">{categoryName}</h2>
        </div>

        {loading ? (
          <div className="catalog-loading">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="catalog-error">
            <p>Error: {error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="catalog-empty">
            <p>No products found in this category. We're restocking soon!</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
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
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;

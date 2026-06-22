import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Star, Heart } from 'lucide-react';

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

  const categoryName = categorySlugMapping[categorySlug] || categorySlug;

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/products?category=${encodeURIComponent(categoryName)}`);
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

  const toggleLike = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
    // TODO: Persist liked items to user profile on backend
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
                  <div className="heart-btn" onClick={e => toggleLike(e, product._id)}>
                    <Heart size={18} fill={liked[product._id] ? "#e11d48" : "none"} color={liked[product._id] ? "#e11d48" : "#4b5563"} />
                  </div>
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
                    <button className="btn-card btn-card-outline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>Add to Cart</button>
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

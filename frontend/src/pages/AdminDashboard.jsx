import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Package, FolderOpen, Layers, ShoppingCart, CreditCard, 
  Archive, Users, Tag, Star, Radio, BarChart2, UsersRound, 
  Settings, FileText, Search, ExternalLink, Bell, CheckCircle, 
  ShoppingBag, HelpCircle, TrendingUp, TrendingDown, ArrowUpRight,
  ChevronRight, ChevronDown, Heart, Plus, Edit, Trash2, MoreVertical, Filter,
  PartyPopper, Calendar, Percent, Eye, UploadCloud, CheckSquare, Square,
  Image as ImageIcon, Ticket, Save, Rocket, AlertCircle, Info, 
  ListChecks, CalendarRange, MonitorPlay, ShieldCheck, ArrowUp, ArrowDown
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import API_BASE from '../config/api';

const mockCategories = [
  { id: 1, name: 'Glass Bangles', desc: 'Traditional and designer glass bangles', products: 45, status: 'Active' },
  { id: 2, name: 'Jewellery Set', desc: 'Handcrafted terracotta necklaces and earrings', products: 12, status: 'Active' },
  { id: 3, name: 'Jumkas', desc: 'Beautiful handpainted temple jumkas', products: 28, status: 'Active' },
  { id: 4, name: 'Studs', desc: 'Daily wear aesthetic clay studs', products: 15, status: 'Active' },
  { id: 5, name: 'Bridal Set', desc: 'Grand heavy terracotta bridal jewellery', products: 8, status: 'Active' },
  { id: 6, name: 'Kids wear', desc: 'Lightweight clay jewellery for children', products: 20, status: 'Active' },
  { id: 7, name: 'Combos', desc: 'Mix and match bangle combos', products: 18, status: 'Active' }
];

const mockServices = [
  { id: 1, name: 'Organisers & Decors', duration: 'N/A', price: '₹350 - ₹1200', bookings: 145 },
  { id: 2, name: 'Gift Hampers', duration: 'Custom', price: '₹999 - ₹2500', bookings: 82 },
  { id: 3, name: 'Design Studio', duration: 'Consultation', price: '₹500', bookings: 28 }
];

const SearchableDropdown = ({ options, name, value = [], onChange, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelect = (optName) => {
    let newValue;
    if (value.includes(optName)) {
      newValue = value.filter(v => v !== optName);
    } else {
      newValue = [...value, optName];
    }
    onChange({ target: { name, value: newValue } });
  };

  const displayValue = value.length > 0 ? value.join(', ') : '';

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', 
          fontSize: '0.875rem', background: disabled ? '#f8fafc' : 'white', 
          color: disabled ? '#94a3b8' : 'inherit', 
          cursor: disabled ? 'not-allowed' : 'text',
          gap: '4px'
        }}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
          }
        }}
      >
        <input 
          type="text" 
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: 0, color: 'inherit', fontSize: 'inherit', cursor: disabled ? 'not-allowed' : 'text' }}
        />
        <ChevronDown size={16} onClick={(e) => { e.stopPropagation(); if (!disabled) { setIsOpen(!isOpen); if(!isOpen) setSearchTerm(''); } }} style={{ cursor: disabled ? 'not-allowed' : 'pointer', color: '#94a3b8', flexShrink: 0 }} />
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50, maxHeight: '200px', overflowY: 'auto' }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => {
              const isSelected = value.includes(opt.name);
              return (
                <div 
                  key={opt._id || opt.id || opt.name}
                  onClick={(e) => { e.stopPropagation(); handleSelect(opt.name); }}
                  style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isSelected ? '#f8fafc' : 'white', fontWeight: isSelected ? 500 : 400 }}
                  onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.target.style.background = isSelected ? '#f8fafc' : 'white'}
                >
                  {opt.name}
                  {isSelected ? <CheckSquare size={16} color="#3b82f6" /> : <Square size={16} color="#cbd5e1" />}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center' }}>No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Data state (empty for now, to be fetched from API later)
  const [revenueData, setRevenueData] = useState([]);
  const [churnData, setChurnData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [paymentOverview, setPaymentOverview] = useState([]);

  // Products Table State
  const [allProducts, setAllProducts] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productFilterCategory, setProductFilterCategory] = useState('All Categories');

  // Add Product Modal State
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    color: '',
    isPopular: false,
    images: []
  });

  // Category Modal State
  const [allCategories, setAllCategories] = useState([]);
  const [allFestivals, setAllFestivals] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    description: '',
    status: 'Active',
    group: 'Bangles',
    existingImage: '',
    existingImageName: '',
    imageFile: null
  });

  const [isAddingFestival, setIsAddingFestival] = useState(false);
  const [isEditingFestival, setIsEditingFestival] = useState(false);
  const [editingFestivalId, setEditingFestivalId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [festivalToDelete, setFestivalToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [newFestivalForm, setNewFestivalForm] = useState({
    name: '',
    description: '',
    discountType: '',
    discountValue: '',
    applyTo: 'All Products',
    categories: [],
    products: [],
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    desktopBanner: null,
    mobileBanner: null,
    bannerText: '',
    showBadge: true,
    showTimer: true,
    featureOnHome: true
  });

  const handleCancelFestival = () => {
    setIsAddingFestival(false);
    setIsEditingFestival(false);
    setEditingFestivalId(null);
    setNewFestivalForm({
      name: '',
      description: '',
      discountType: '',
      discountValue: '',
      applyTo: 'All Products',
      categories: [],
      products: [],
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      desktopBanner: null,
      mobileBanner: null,
      bannerText: '',
      showBadge: true,
      showTimer: true,
      featureOnHome: true
    });
  };

  const handleFestivalInputChange = (e) => {
    const { name, value } = e.target;
    setNewFestivalForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditFestivalClick = (fest) => {
    setIsAddingFestival(true);
    setIsEditingFestival(true);
    setEditingFestivalId(fest._id);
    
    // Convert ID arrays to name arrays for the form state
    const catNames = fest.categories ? fest.categories.map(c => {
      if (typeof c === 'object') return c.name;
      const found = allCategories.find(cat => cat._id === c || cat.id === c);
      return found ? found.name : '';
    }).filter(Boolean) : [];
    
    const prodNames = fest.products ? fest.products.map(p => {
      if (typeof p === 'object') return p.name;
      const found = allProducts.find(prod => prod._id === p || prod.id === p);
      return found ? found.name : '';
    }).filter(Boolean) : [];

    setNewFestivalForm({
      name: fest.name || '',
      description: fest.description || '',
      discountType: fest.discountType || '',
      discountValue: fest.discountValue || '',
      applyTo: fest.applyTo || 'All Products',
      categories: catNames,
      products: prodNames,
      startDate: fest.startDate || '',
      startTime: fest.startTime || '',
      endDate: fest.endDate || '',
      endTime: fest.endTime || '',
      desktopBanner: null,
      mobileBanner: null,
      existingDesktopBanner: fest.desktopBannerUrl || '',
      existingMobileBanner: fest.mobileBannerUrl || '',
      bannerText: fest.bannerText || '',
      showBadge: fest.showBadge !== false,
      showTimer: fest.showTimer !== false,
      featureOnHome: fest.featureOnHome !== false
    });
  };

  const handleLaunchOffer = async (e) => {
    e.preventDefault();
    if (!newFestivalForm.name || !newFestivalForm.discountType || !newFestivalForm.discountValue) {
      alert("Please fill in the required fields");
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(newFestivalForm).forEach(key => {
        if (key === 'desktopBanner' || key === 'mobileBanner') {
          if (newFestivalForm[key]) {
            formData.append(key, newFestivalForm[key]);
          }
        } else if (key === 'categories') {
          const categoryIds = newFestivalForm.categories.map(catName => {
            const found = allCategories.find(c => c.name === catName);
            return found ? (found._id || found.id) : null;
          }).filter(id => id !== null);
          formData.append('categories', JSON.stringify(categoryIds));
        } else if (key === 'products') {
          const productIds = newFestivalForm.products.map(prodName => {
            const found = allProducts.find(p => p.name === prodName);
            return found ? (found._id || found.id) : null;
          }).filter(id => id !== null);
          formData.append('products', JSON.stringify(productIds));
        } else {
          formData.append(key, newFestivalForm[key]);
        }
      });
      
      // Explicitly set the new festival as active
      if (!isEditingFestival) {
        formData.append('isActive', true);
      }

      const url = isEditingFestival ? `${API_BASE}/festivals/${editingFestivalId}` : `${API_BASE}/festivals`;
      const method = isEditingFestival ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: formData
      });

      if (res.ok) {
        alert(isEditingFestival ? "Festival offer updated successfully!" : "Festival offer launched successfully!");
        const newFest = await res.json();
        if (isEditingFestival) {
          setAllFestivals(prev => prev.map(f => f._id === editingFestivalId ? newFest : f));
        } else {
          setAllFestivals(prev => [newFest, ...prev]);
        }
        handleCancelFestival();
      } else {
        const errText = await res.text();
        console.error("Backend Error:", res.status, errText);
        alert(isEditingFestival ? `Failed to update festival offer: ${errText}` : "Failed to launch festival offer.");
      }
    } catch (err) {
      console.error(err);
      alert("Error launching festival offer");
    }
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategoryForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryFileChange = (e) => {
    setNewCategoryForm(prev => ({ ...prev, imageFile: e.target.files[0] }));
  };

  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryForm.name) {
      alert("Category name is required.");
      return;
    }
    
    setIsAddingCategory(true);
    try {
      const url = isEditingCategory ? `${API_BASE}/categories/${editingCategoryId}` : `${API_BASE}/categories`;
      const method = isEditingCategory ? 'PUT' : 'POST';

      const formData = new FormData();
      formData.append('name', newCategoryForm.name);
      formData.append('description', newCategoryForm.description);
      formData.append('status', newCategoryForm.status);
      formData.append('group', newCategoryForm.group);
      if (newCategoryForm.imageFile) {
        formData.append('image', newCategoryForm.imageFile);
        formData.append('originalImageName', newCategoryForm.imageFile.name);
      }

      const res = await fetch(url, {
        method,
        body: formData
      });

      if (res.ok) {
        const savedCat = await res.json();
        if (isEditingCategory) {
          setAllCategories(prev => prev.map(c => c._id === editingCategoryId ? savedCat : c));
        } else {
          setAllCategories(prev => [...prev, savedCat]);
        }
        setIsCategoryModalOpen(false);
        setIsEditingCategory(false);
        setEditingCategoryId(null);
        setNewCategoryForm({ name: '', description: '', status: 'Active', group: 'Bangles', existingImage: '', existingImageName: '', imageFile: null });
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to save category');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleEditCategoryClick = (category) => {
    setIsEditingCategory(true);
    setEditingCategoryId(category._id);
    setNewCategoryForm({
      name: category.name || '',
      description: category.description || '',
      status: category.status || 'Active',
      group: category.group || 'Bangles',
      existingImage: category.image || '',
      existingImageName: category.originalImageName || (category.image ? category.image.split('/').pop() : ''),
      imageFile: null
    });
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`${API_BASE}/categories/${categoryId}`, { method: 'DELETE' });
      if (res.ok) {
        setAllCategories(prev => prev.filter(c => c._id !== categoryId));
      } else {
        alert("Failed to delete category.");
      }
    } catch (err) {
      console.error(err);
    }
  };


  const handleProductInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProductForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProductFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewProductForm(prev => ({ ...prev, images: Array.from(e.target.files) }));
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.category || !newProductForm.price || (!isEditMode && newProductForm.images.length === 0)) {
      alert("Name, Category, Price, and at least one Image are required.");
      return;
    }
    
    if (newProductForm.images.length > 20) {
      alert("You can upload a maximum of 20 images per product.");
      return;
    }
    
    setIsAddingProduct(true);
    try {
      const formData = new FormData();
      formData.append('name', newProductForm.name);
      formData.append('description', newProductForm.description);
      formData.append('category', newProductForm.category);
      formData.append('price', newProductForm.price);
      formData.append('stock', newProductForm.stock);
      formData.append('color', newProductForm.color);
      formData.append('isPopular', newProductForm.isPopular);
      
      // Append each file with the key 'images'
      newProductForm.images.forEach(file => {
        if (file instanceof File) {
          formData.append('images', file);
        }
      });

      const url = isEditMode ? `${API_BASE}/products/${editingProductId}` : `${API_BASE}/products`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: formData
      });

      if (res.ok) {
        const savedProduct = await res.json();
        if (isEditMode) {
          setAllProducts(prev => prev.map(p => p._id === editingProductId ? savedProduct : p));
        } else {
          setAllProducts(prev => [savedProduct, ...prev]);
        }
        setIsAddProductModalOpen(false);
        setIsEditMode(false);
        setEditingProductId(null);
        setNewProductForm({ name: '', description: '', category: '', price: '', stock: '', color: '', isPopular: false, images: [] });
      } else {
        let errMsg = isEditMode ? 'Failed to update product' : 'Failed to add product';
        try {
          const errorData = await res.json();
          errMsg = errorData.message || errMsg;
        } catch (jsonErr) {
          errMsg = `Server error (Status: ${res.status})`;
        }
        alert(errMsg);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleEditClick = (product) => {
    setIsEditMode(true);
    setEditingProductId(product._id);
    setNewProductForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      price: product.price || '',
      stock: product.stock || '',
      color: product.color || '',
      isPopular: product.isPopular || false,
      images: [] 
    });
    setIsAddProductModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAllProducts(prev => prev.filter(p => p._id !== productId));
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    }
  };


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products`);
        if (res.ok) {
          const data = await res.json();
          setAllProducts(data);
        }
      } catch (err) {
        console.error('Failed to fetch products for admin panel:', err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/categories`);
        if (res.ok) {
          const data = await res.json();
          setAllCategories(data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    const fetchFestivals = async () => {
      try {
        const res = await fetch(`${API_BASE}/festivals`);
        if (res.ok) {
          const data = await res.json();
          setAllFestivals(data);
        }
      } catch (err) {
        console.error('Failed to fetch festivals:', err);
      }
    };

    fetchProducts();
    fetchCategories();
    fetchFestivals();
  }, []);

  const promptDeleteFestival = (festival) => {
    setFestivalToDelete(festival);
    setDeleteConfirmationText('');
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteFestival = async () => {
    if (!festivalToDelete || deleteConfirmationText !== festivalToDelete.name) return;
    try {
      const res = await fetch(`${API_BASE}/festivals/${festivalToDelete._id}`, { method: 'DELETE' });
      if (res.ok) {
        setAllFestivals(prev => prev.filter(f => f._id !== festivalToDelete._id));
        setIsDeleteModalOpen(false);
        setFestivalToDelete(null);
      } else {
        alert("Failed to delete festival.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getFestivalStatus = (fest) => {
    const now = new Date();
    const start = new Date(`${fest.startDate}T${fest.startTime}`);
    const end = new Date(`${fest.endDate}T${fest.endTime}`);
    if (now < start) return 'Scheduled';
    if (now > end) return 'Completed';
    if (fest.isDown) return 'Paused';
    return 'On-Going';
  };

  const handleToggleDown = async (festivalId) => {
    try {
      const res = await fetch(`${API_BASE}/festivals/${festivalId}/toggle-down`, { method: 'PATCH' });
      if (res.ok) {
        const updatedFest = await res.json();
        setAllFestivals(prev => prev.map(f => f._id === festivalId ? updatedFest : f));
      } else {
        alert('Failed to toggle festival status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    }
  };

  const filteredProducts = allProducts.filter(product => {
    const nameStr = product.name ? product.name.toLowerCase() : '';
    const idStr = product._id ? product._id.toString().toLowerCase() : '';
    
    const matchesSearch = nameStr.includes(productSearchQuery.toLowerCase()) || 
                          idStr.includes(productSearchQuery.toLowerCase());
    const matchesFilter = productFilterCategory === 'All Categories' || product.category === productFilterCategory;
    return matchesSearch && matchesFilter;
  });

  const uniqueProductCategories = ['All Categories', ...new Set(allCategories.map(c => c.name).filter(Boolean))];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <span className="logo-accent">RaHa</span> Creations
          </div>
          <div className="admin-panel-text">Admin Panel</div>
        </div>

        <div className="admin-sidebar-content">
          <button 
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            style={{ marginBottom: '1.5rem', background: activeTab === 'dashboard' ? '#e11d48' : '#1e293b', color: 'white' }}
          >
            <div className="admin-nav-item-left">
              <Home size={18} /> Dashboard
            </div>
          </button>

          <div className="admin-nav-group">
            <div className="admin-nav-group-title">Catalog</div>
            <button className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')} style={{ background: activeTab === 'products' ? '#e11d48' : 'transparent', color: activeTab === 'products' ? 'white' : '#94a3b8' }}>
              <div className="admin-nav-item-left"><Package size={18} /> Products</div> <ChevronRight />
            </button>
            <button className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')} style={{ background: activeTab === 'categories' ? '#e11d48' : 'transparent', color: activeTab === 'categories' ? 'white' : '#94a3b8' }}>
              <div className="admin-nav-item-left"><FolderOpen size={18} /> Categories</div> <ChevronRight />
            </button>
            <button className={`admin-nav-item ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')} style={{ background: activeTab === 'services' ? '#e11d48' : 'transparent', color: activeTab === 'services' ? 'white' : '#94a3b8' }}>
              <div className="admin-nav-item-left"><Layers size={18} /> Services</div> <ChevronRight />
            </button>
            <button className={`admin-nav-item ${activeTab === 'festival' ? 'active' : ''}`} onClick={() => setActiveTab('festival')} style={{ background: activeTab === 'festival' ? '#e11d48' : 'transparent', color: activeTab === 'festival' ? 'white' : '#94a3b8' }}>
              <div className="admin-nav-item-left"><PartyPopper size={18} /> Festival Addition</div> <ChevronRight />
            </button>
          </div>

          <div className="admin-nav-group">
            <div className="admin-nav-group-title">Operations</div>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><CreditCard size={18} /> Payments Ledger</div></button>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><Archive size={18} /> Inventory Control</div></button>
          </div>

          <div className="admin-nav-group">
            <div className="admin-nav-group-title">Customers & Marketing</div>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><Users size={18} /> Customers Portal</div> <ChevronRight /></button>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><Tag size={18} /> Coupons & Referrals</div> <ChevronRight /></button>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><Star size={18} /> Reviews Management</div> <ChevronRight /></button>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><Radio size={18} /> Broadcast Notifications</div></button>
          </div>

          <div className="admin-nav-group">
            <div className="admin-nav-group-title">Analytics</div>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><BarChart2 size={18} /> Analytics & Reports</div> <ChevronRight /></button>
          </div>

          <div className="admin-nav-group">
            <div className="admin-nav-group-title">System</div>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><UsersRound size={18} /> Users & Roles</div> <ChevronRight /></button>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><Settings size={18} /> Settings</div></button>
            <button className="admin-nav-item"><div className="admin-nav-item-left"><FileText size={18} /> Activity Logs</div></button>
          </div>
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-help-icon"><HelpCircle size={18} /></div>
          <div className="admin-help-text">
            <div style={{ fontWeight: 600, color: '#f43f5e', fontSize: '0.8rem' }}>Need Help?</div>
            <div style={{ fontSize: '0.75rem' }}>Contact Support</div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-search">
            <Search size={16} color="#94a3b8" />
            <input type="text" placeholder="Search anything..." />
          </div>
          
          <div className="admin-header-right">
            <a href="/" className="admin-visit-store" target="_blank" rel="noreferrer">
              Visit Store <ExternalLink size={14} />
            </a>
            
            <div className="admin-notification">
              <Bell size={20} />
              <div className="admin-notification-badge">5</div>
            </div>

            <div className="admin-profile">
              <div className="admin-profile-info">
                <span className="admin-profile-name">Admin</span>
                <span className="admin-profile-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="admin-content-scroll">
          {activeTab === 'dashboard' && (
            <>
              {/* Top Metrics Row */}
          <div className="admin-metrics-grid">
            <div className="admin-card admin-metric-card">
              <div className="admin-card-title">Today's Orders</div>
              <div className="admin-metric-value">0</div>
              <div className="admin-metric-trend trend-neutral">0% from yesterday</div>
            </div>
            
            <div className="admin-card admin-metric-card">
              <div className="admin-card-title">Revenue Today</div>
              <div className="admin-metric-value">₹0</div>
              <div className="admin-metric-trend trend-neutral">0% from yesterday</div>
            </div>

            <div className="admin-card admin-metric-card">
              <div className="admin-card-title">Pending Orders</div>
              <div className="admin-metric-value">0</div>
              <div className="admin-metric-trend trend-neutral">View all pending</div>
            </div>

            <div className="admin-card admin-metric-card">
              <div className="admin-card-title">Customers</div>
              <div className="admin-metric-value">0</div>
              <div className="admin-metric-trend trend-neutral">0% this month</div>
            </div>

            <div className="admin-card admin-metric-card">
              <div className="admin-card-title">Low Stock Alerts</div>
              <div className="admin-metric-value">0</div>
              <div className="admin-metric-trend trend-down">View all alerts</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="admin-charts-grid">
            {/* Revenue Line Chart */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Revenue Overview</div>
                <select className="admin-dropdown">
                  <option>This Year</option>
                </select>
              </div>
              <div style={{ height: '250px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales by Category Progress Bars */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Sales By Category</div>
                <select className="admin-dropdown">
                  <option>This Month</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                {categoryData.length === 0 && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>No data available</div>}
                {categoryData.map((cat, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{cat.name}</span>
                      <span style={{ color: '#64748b' }}>{cat.amount} <span style={{ fontWeight: 600 }}>{cat.percent}%</span></span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${cat.percent}%`, background: cat.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tables Row */}
          <div className="admin-tables-grid">
            {/* Recent Orders */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Recent Orders</div>
                <span className="view-all-link">View All Orders</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8' }}>No recent orders</td>
                    </tr>
                  )}
                  {recentOrders.map((order, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{order.id}</td>
                      <td>
                        <div className="admin-avatar-cell">
                          <img src={`https://i.pravatar.cc/150?u=${idx}`} alt={order.name} />
                          {order.name}
                        </div>
                      </td>
                      <td>{order.items} items</td>
                      <td style={{ fontWeight: 600 }}>{order.amt}</td>
                      <td>
                        <span className="admin-status-pill" style={{ color: order.color, background: order.bg }}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.date}</td>
                      <td style={{ textAlign: 'right', color: '#94a3b8', cursor: 'pointer' }}>⋮</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Low Stock Alerts */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Low Stock Alerts</div>
                <span className="view-all-link">View All</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {lowStockAlerts.length === 0 && <div style={{ fontSize: '0.75rem', color: '#64748b', padding: '1rem 0' }}>No low stock alerts</div>}
                {lowStockAlerts.map((item, idx) => (
                  <div className="admin-list-item" key={idx}>
                    <div className="admin-product-cell">
                      <img src={item.img} alt={item.name} />
                      <div className="admin-product-info">
                        <h4>{item.name}</h4>
                        <p>{item.sub}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Stock Left</div>
                      <div style={{ color: '#ef4444', fontWeight: 700 }}>{item.left}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Reorder Level</div>
                      <div style={{ color: '#0f172a', fontWeight: 600 }}>{item.reorder}</div>
                    </div>
                    <button className="btn-restock">Restock</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="admin-bottom-grid">
            {/* Top Selling Products */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Top Selling Products</div>
                <select className="admin-dropdown"><option>This Month</option></select>
              </div>
              <div>
                {topProducts.length === 0 && <div style={{ fontSize: '0.75rem', color: '#64748b', padding: '1rem 0' }}>No products sold yet</div>}
                {topProducts.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: idx < 2 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: item.rank === 1 ? '#f59e0b' : item.rank === 2 ? '#94a3b8' : '#cd7f32', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700 }}>{item.rank}</div>
                      <img src={item.img} alt={item.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                      <div className="admin-product-info">
                        <h4>{item.name}</h4>
                        <p>{item.sold}</p>
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.75rem', color: '#0f172a' }}>{item.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Churn Analytics */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Customer Churn Analytics</div>
                <select className="admin-dropdown"><option>This 90 Days</option></select>
              </div>
              <div style={{ display: 'flex', height: '140px', alignItems: 'center' }}>
                <div style={{ width: '45%', height: '100%', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie data={churnData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} stroke="none" dataKey="value">
                        {churnData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={3} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>0%</div>
                    <div style={{ fontSize: '0.5rem', color: '#64748b' }}>Active Churn Rate</div>
                  </div>
                </div>
                <div style={{ width: '55%', paddingLeft: '0.5rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>RISK COHORTS</div>
                  {churnData.length === 0 && <div style={{ fontSize: '0.65rem', color: '#64748b' }}>No data available</div>}
                  {churnData.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.7rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }}></div>
                        <span style={{ color: '#1e293b', fontWeight: 500 }}>{item.name}</span>
                      </div>
                      <div style={{ color: '#0f172a', fontWeight: 600 }}>{item.value} <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.6rem' }}>({((item.value/1246)*100).toFixed(0)}%)</span></div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: '#64748b', fontWeight: 500, marginTop: '0.5rem' }}>
                0% from last 90 days
              </div>
              <button style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid #f43f5e', color: '#f43f5e', borderRadius: '6px', fontWeight: 600, fontSize: '0.75rem', marginTop: '1rem', cursor: 'pointer' }}>
                Trigger Re-engagement Campaign
              </button>
            </div>

            {/* Today's Notifications */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Today's Notifications</div>
                <span className="view-all-link">View All</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                {notifications.length === 0 && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>No new notifications</div>}
                {notifications.map((notif, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ color: '#3b82f6', background: '#dbeafe', padding: '0.3rem', borderRadius: '50%' }}><Bell size={12} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 500 }}>{notif.msg}</div>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{notif.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Overview */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Payment Overview</div>
                <select className="admin-dropdown"><option>This Month</option></select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '0.5rem' }}>
                {paymentOverview.length === 0 && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>No payment data</div>}
                {paymentOverview.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ padding: '0.4rem', borderRadius: '6px', color: item.color, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.icon}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#0f172a' }}>{item.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>{item.amt}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', width: '25px', textAlign: 'right' }}>{item.percent}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          </>
          )}

          {activeTab === 'products' && (
            <div className="admin-tab-view">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>Products Management</h2>
                <button 
                  onClick={() => { setIsEditMode(false); setEditingProductId(null); setNewProductForm({ name: '', description: '', category: '', price: '', stock: '', color: '', images: [] }); setIsAddProductModalOpen(true); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e11d48', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Plus size={18} /> Add New Product
                </button>
              </div>
              <div className="admin-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div className="admin-search" style={{ width: '400px' }}>
                    <Search size={16} color="#94a3b8" />
                    <input 
                      type="text" 
                      placeholder="Search products by name or ID..." 
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '6px', color: '#64748b', cursor: 'pointer', outline: 'none', fontFamily: 'inherit', fontSize: '0.875rem' }}
                    value={productFilterCategory}
                    onChange={(e) => setProductFilterCategory(e.target.value)}
                  >
                    {uniqueProductCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 0' }}>No products found matching your search.</td></tr>
                    ) : (
                      filteredProducts.map((product, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src={product.images[0]} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: 500, color: '#0f172a' }}>{product.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{product._id}</div>
                            </div>
                          </div>
                        </td>
                        <td>{product.category}</td>
                        <td style={{ fontWeight: 500 }}>₹{product.price}</td>
                        <td>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', background: product.stock > 15 ? '#dcfce7' : '#fef08a', color: product.stock > 15 ? '#16a34a' : '#a16207', fontWeight: 600 }}>
                            {product.stock} in stock
                          </span>
                        </td>
                        <td>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', background: '#dcfce7', color: '#16a34a', fontWeight: 600 }}>Active</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleEditClick(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Edit size={16} /></button>
                            <button onClick={() => handleDeleteProduct(product._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="admin-tab-view">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>Categories Management</h2>
                <button onClick={() => { setIsEditingCategory(false); setEditingCategoryId(null); setNewCategoryForm({ name: '', description: '', status: 'Active', group: 'Bangles', imageFile: null }); setIsCategoryModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e11d48', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  <Plus size={18} /> Add Category
                </button>
              </div>
              <div className="admin-card" style={{ padding: '1.5rem' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Category Name</th>
                      <th>Description</th>
                      <th>Total Products</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      if (allCategories.length === 0) {
                        return <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No categories found.</td></tr>;
                      }

                      const groups = ['Bangles', 'Terracotta Jewellery', 'Our Services'];
                      const grouped = {};
                      groups.forEach(g => grouped[g] = []);
                      allCategories.forEach(c => {
                        const g = c.group || 'Bangles';
                        if (!grouped[g]) grouped[g] = [];
                        grouped[g].push(c);
                      });

                      return Object.keys(grouped).map(groupName => (
                        <React.Fragment key={groupName}>
                          {grouped[groupName].length > 0 && (
                            <tr>
                              <td colSpan="5" style={{ background: '#f8fafc', fontWeight: 700, color: '#334155', padding: '1rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', fontSize: '0.875rem' }}>
                                {groupName}
                              </td>
                            </tr>
                          )}
                          {grouped[groupName].map((cat, idx) => (
                            <tr key={`${groupName}-${idx}`}>
                              <td style={{ fontWeight: 500, color: '#0f172a', paddingLeft: '2rem' }}>{cat.name}</td>
                              <td style={{ color: '#64748b' }}>{cat.description || '-'}</td>
                              <td style={{ fontWeight: 500 }}>{cat.products || 0} items</td>
                              <td>
                                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', background: cat.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: cat.status === 'Active' ? '#16a34a' : '#64748b', fontWeight: 600 }}>{cat.status || 'Active'}</span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button onClick={() => handleEditCategoryClick(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Edit size={16} /></button>
                                  <button onClick={() => handleDeleteCategory(cat._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="admin-tab-view">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>Services Management</h2>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e11d48', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  <Plus size={18} /> Add Service
                </button>
              </div>
              <div className="admin-card" style={{ padding: '1.5rem' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Service Name</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th>Bookings</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockServices.map((srv, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 500, color: '#0f172a' }}>{srv.name}</td>
                        <td style={{ color: '#64748b' }}>{srv.duration}</td>
                        <td style={{ fontWeight: 500 }}>{srv.price}</td>
                        <td style={{ fontWeight: 500 }}>{srv.bookings} completed</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Edit size={16} /></button>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'festival' && !isAddingFestival && (
            <div className="admin-tab-view">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Festival Addition</h2>
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Create and manage festival offers, discounts and special promotions.</p>
                </div>
                <button onClick={() => setIsAddingFestival(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e11d48', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  <Plus size={18} /> Add Festival Offer
                </button>
              </div>

              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="admin-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}>
                    <Tag size={24} />
                  </div>
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Active Offers</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{allFestivals.filter(f => getFestivalStatus(f) === 'On-Going').length}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Currently running</div>
                  </div>
                </div>
                <div className="admin-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                    <Calendar size={24} />
                  </div>
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Upcoming Offers</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{allFestivals.filter(f => getFestivalStatus(f) === 'Scheduled').length}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Scheduled</div>
                  </div>
                </div>
                <div className="admin-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                    <Percent size={24} />
                  </div>
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Total Festivals</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{allFestivals.length}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Created across platform</div>
                  </div>
                </div>
                <div className="admin-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                    <ShoppingBag size={24} />
                  </div>
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Total Usage</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>0</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Redemptions</div>
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" placeholder="Search offers..." style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <select style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#475569', background: 'white', outline: 'none' }}>
                    <option>All Status</option>
                  </select>
                  <select style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#475569', background: 'white', outline: 'none' }}>
                    <option>All Festivals</option>
                  </select>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#475569', background: 'white', cursor: 'pointer' }}>
                    <Calendar size={16} /> Select Date Range
                  </button>
                </div>
              </div>

              <div className="admin-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '1.5rem' }}>Offer Name</th>
                      <th>Discount Type</th>
                      <th>Discount Value</th>
                      <th>Applied To</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFestivals.map((fest, idx) => {
                      const status = getFestivalStatus(fest);
                      return (
                      <tr key={fest._id || idx} style={{ borderBottom: idx !== allFestivals.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <td style={{ paddingLeft: '1.5rem', paddingVertical: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                              🎉
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{fest.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{fest.description}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: '#475569', fontSize: '0.875rem' }}>
                          {fest.discountType}
                        </td>
                        <td style={{ fontWeight: 600, color: '#16a34a' }}>
                          {fest.discountValue} {fest.discountType === 'Percentage (%)' ? '%' : '₹'} OFF
                        </td>
                        <td style={{ fontSize: '0.875rem', color: '#475569' }}>
                          {fest.applyTo}
                        </td>
                        <td style={{ fontSize: '0.875rem', color: '#475569' }}>
                          {fest.startDate}
                        </td>
                        <td style={{ fontSize: '0.875rem', color: '#475569' }}>
                          {fest.endDate}
                        </td>
                        <td>
                          <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '99px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            background: status === 'On-Going' ? '#dcfce7' : status === 'Scheduled' ? '#fef3c7' : status === 'Paused' ? '#fef3c7' : '#e0e7ff', 
                            color: status === 'On-Going' ? '#16a34a' : status === 'Scheduled' ? '#d97706' : status === 'Paused' ? '#d97706' : '#4f46e5'
                          }}>
                            {status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <button 
                              title="Bring offer up (show to users)"
                              disabled={status === 'Completed' || status === 'On-Going' || status === 'Scheduled'}
                              onClick={() => handleToggleDown(fest._id)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: (status === 'Paused') ? 'pointer' : 'not-allowed', 
                                color: (status === 'Paused') ? '#16a34a' : '#cbd5e1' 
                              }}
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button 
                              title="Take offer down (hide from users)"
                              disabled={status === 'Completed' || status === 'Paused' || status === 'Scheduled'}
                              onClick={() => handleToggleDown(fest._id)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: (status === 'On-Going') ? 'pointer' : 'not-allowed', 
                                color: (status === 'On-Going') ? '#ef4444' : '#cbd5e1' 
                              }}
                            >
                              <ArrowDown size={16} />
                            </button>
                            <button 
                              disabled={status === 'Completed' || status === 'On-Going'}
                              onClick={() => handleEditFestivalClick(fest)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: (status === 'Completed' || status === 'On-Going') ? 'not-allowed' : 'pointer', 
                                color: (status === 'Completed' || status === 'On-Going') ? '#cbd5e1' : '#94a3b8' 
                              }}
                            >
                              <Edit size={16} />
                            </button>
                            <button onClick={() => promptDeleteFestival(fest)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'festival' && isAddingFestival && (
            <div className="admin-tab-view">
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>{isEditingFestival ? 'Edit Festival Offer' : 'Add New Festival Offer'}</h2>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Create festival offers, discounts and promotions for your customers.</p>
              </div>

              <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                {/* Form Sections Grid */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
                  
                  {/* 1. Basic Information */}
                  <div className="admin-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e11d48', fontWeight: 600, marginBottom: '1rem', fontSize: '0.875rem' }}>
                      <Info size={16} /> 1. Basic Information
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>Offer Name *</label>
                      <input type="text" name="name" value={newFestivalForm.name} onChange={handleFestivalInputChange} placeholder="e.g., Diwali, Christmas, Pongal" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>Description</label>
                      <textarea rows="3" name="description" value={newFestivalForm.description} onChange={handleFestivalInputChange} placeholder="Describe the offer and its benefits..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' }} />
                    </div>
                  </div>

                  {/* 2. Discount Configuration */}
                  <div className="admin-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e11d48', fontWeight: 600, marginBottom: '1rem', fontSize: '0.875rem' }}>
                      <Percent size={16} /> 2. Discount Configuration
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>Discount Type *</label>
                        <select name="discountType" value={newFestivalForm.discountType} onChange={handleFestivalInputChange} style={{ width: '100%', padding: '0.75rem 2rem 0.75rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', background: 'white', textOverflow: 'ellipsis' }}>
                          <option value="">Select type</option>
                          <option value="Percentage (%)">Percentage (%)</option>
                          <option value="Fixed Amount (₹)">Fixed Amount (₹)</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>Discount Value *</label>
                        <input type="text" name="discountValue" value={newFestivalForm.discountValue} onChange={handleFestivalInputChange} placeholder="e.g., 20 or 500" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' }} />
                      </div>
                    </div>
                  </div>

                  {/* 3. Applicability */}
                  <div className="admin-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e11d48', fontWeight: 600, marginBottom: '1rem', fontSize: '0.875rem' }}>
                      <ListChecks size={16} /> 3. Applicability
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>Apply To *</label>
                      <select name="applyTo" value={newFestivalForm.applyTo} onChange={handleFestivalInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', background: 'white' }}>
                        <option value="All Products">All Products</option>
                        <option value="Specific Categories">Specific Categories</option>
                        <option value="Specific Products">Specific Products</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: newFestivalForm.applyTo !== 'Specific Categories' ? '#94a3b8' : '#0f172a', marginBottom: '0.5rem' }}>Categories</label>
                        <SearchableDropdown 
                          name="categories"
                          options={allCategories}
                          value={newFestivalForm.categories}
                          onChange={handleFestivalInputChange}
                          disabled={newFestivalForm.applyTo !== 'Specific Categories'}
                          placeholder="Select categories"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: newFestivalForm.applyTo !== 'Specific Products' ? '#94a3b8' : '#0f172a', marginBottom: '0.5rem' }}>Products</label>
                        <SearchableDropdown 
                          name="products"
                          options={allProducts}
                          value={newFestivalForm.products}
                          onChange={handleFestivalInputChange}
                          disabled={newFestivalForm.applyTo !== 'Specific Products'}
                          placeholder="Select products"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Schedule */}
                  <div className="admin-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e11d48', fontWeight: 600, marginBottom: '1rem', fontSize: '0.875rem' }}>
                      <CalendarRange size={16} /> 4. Schedule
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>Start Date *</label>
                        <div>
                          <input type="date" name="startDate" value={newFestivalForm.startDate} onChange={handleFestivalInputChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', color: newFestivalForm.startDate ? '#0f172a' : '#94a3b8' }} />
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>End Date *</label>
                        <div>
                          <input type="date" name="endDate" value={newFestivalForm.endDate} onChange={handleFestivalInputChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', color: newFestivalForm.endDate ? '#0f172a' : '#94a3b8' }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>Start Time *</label>
                        <div>
                          <input type="time" name="startTime" value={newFestivalForm.startTime} onChange={handleFestivalInputChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', color: newFestivalForm.startTime ? '#0f172a' : '#94a3b8' }} />
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>End Time *</label>
                        <div>
                          <input type="time" name="endTime" value={newFestivalForm.endTime} onChange={handleFestivalInputChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', color: newFestivalForm.endTime ? '#0f172a' : '#94a3b8' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Display Settings */}
                  <div className="admin-card" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e11d48', fontWeight: 600, marginBottom: '1rem', fontSize: '0.875rem' }}>
                      <MonitorPlay size={16} /> 5. Display Settings
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>Festival Banners</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <label style={{ flex: 1, display: 'block', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '0.75rem', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}>
                            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => setNewFestivalForm(prev => ({...prev, desktopBanner: e.target.files[0]}))} />
                            <UploadCloud size={20} color="#94a3b8" style={{ margin: '0 auto 0.25rem' }} />
                            <div style={{ fontSize: '0.7rem', color: '#4f46e5', fontWeight: 500 }}>
                              {newFestivalForm.desktopBanner ? newFestivalForm.desktopBanner.name : (newFestivalForm.existingDesktopBanner ? 'Keep Existing Desktop Banner' : 'Desktop Banner')}
                            </div>
                          </label>
                          <label style={{ flex: 1, display: 'block', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '0.75rem', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}>
                            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => setNewFestivalForm(prev => ({...prev, mobileBanner: e.target.files[0]}))} />
                            <UploadCloud size={20} color="#94a3b8" style={{ margin: '0 auto 0.25rem' }} />
                            <div style={{ fontSize: '0.7rem', color: '#4f46e5', fontWeight: 500 }}>
                              {newFestivalForm.mobileBanner ? newFestivalForm.mobileBanner.name : (newFestivalForm.existingMobileBanner ? 'Keep Existing Mobile Banner' : 'Mobile Banner')}
                            </div>
                          </label>
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>Banner Text (Optional)</label>
                        <textarea rows="3" name="bannerText" value={newFestivalForm.bannerText} onChange={handleFestivalInputChange} placeholder="e.g., Big Savings on Diwali!" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" name="showBadge" checked={newFestivalForm.showBadge} onChange={(e) => setNewFestivalForm(prev => ({...prev, showBadge: e.target.checked}))} style={{ accentColor: '#e11d48' }} /> Show Festival Badge
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" name="showTimer" checked={newFestivalForm.showTimer} onChange={(e) => setNewFestivalForm(prev => ({...prev, showTimer: e.target.checked}))} style={{ accentColor: '#e11d48' }} /> Show Countdown Timer
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" name="featureOnHome" checked={newFestivalForm.featureOnHome} onChange={(e) => setNewFestivalForm(prev => ({...prev, featureOnHome: e.target.checked}))} style={{ accentColor: '#e11d48' }} /> Feature on Homepage
                      </label>
                    </div>
                  </div>

                </div>
              </div>
              
              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', padding: '1rem 0' }}>
                <button onClick={handleCancelFestival} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#e11d48', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={16} /> Save Draft
                </button>
                <button onClick={handleLaunchOffer} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#e11d48', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Rocket size={16} /> {isEditingFestival ? 'Save Changes' : 'Launch Offer'}
                </button>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', marginTop: '1rem' }}>
            © 2025 RaHa Creations Admin Panel. All rights reserved. <span style={{ float: 'right' }}>Made with <Heart size={12} color="#f43f5e" fill="#f43f5e" style={{ display: 'inline', verticalAlign: 'middle' }} /> for handcrafted love</span>
          </div>

        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isAddProductModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>{isEditMode ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsAddProductModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#64748b' }}>&times;</button>
            </div>
            
            <form onSubmit={handleAddProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Product Name *</label>
                <input type="text" name="name" value={newProductForm.name} onChange={handleProductInputChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontFamily: 'inherit' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Description</label>
                <textarea name="description" value={newProductForm.description} onChange={handleProductInputChange} rows="3" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Category *</label>
                  <select name="category" value={newProductForm.category} onChange={handleProductInputChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontFamily: 'inherit', backgroundColor: 'white' }}>
                    <option value="" disabled>Select a category</option>
                    {allCategories.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Price (₹) *</label>
                  <input type="number" name="price" value={newProductForm.price} onChange={handleProductInputChange} required min="0" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontFamily: 'inherit' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Stock Quantity</label>
                  <input type="number" name="stock" value={newProductForm.stock} onChange={handleProductInputChange} min="0" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontFamily: 'inherit' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Color</label>
                  <input type="text" name="color" value={newProductForm.color} onChange={handleProductInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontFamily: 'inherit' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                <input type="checkbox" name="isPopular" id="isPopular" checked={newProductForm.isPopular} onChange={handleProductInputChange} style={{ width: '1rem', height: '1rem', cursor: 'pointer' }} />
                <label htmlFor="isPopular" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>Mark as Popular Pick</label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Product Images {isEditMode ? '(Leave empty to keep existing)' : '* (Select multiple, order is preserved)'}</label>
                <input type="file" multiple accept="image/*" onChange={handleProductFileChange} required={!isEditMode} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px dashed #cbd5e1', fontSize: '0.875rem', cursor: 'pointer' }} />
                
                {/* Image Preview / Order Verification */}
                {newProductForm.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {newProductForm.images.map((file, index) => (
                      <div key={index} style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                        <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', padding: '2px 4px', borderBottomRightRadius: '4px' }}>
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsAddProductModalOpen(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isAddingProduct} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: isAddingProduct ? '#f43f5e80' : '#e11d48', color: 'white', fontWeight: 600, cursor: isAddingProduct ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isAddingProduct ? (isEditMode ? 'Updating...' : 'Uploading...') : (isEditMode ? 'Update Product' : 'Save Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {isCategoryModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>{isEditingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#64748b' }}>&times;</button>
            </div>
            
            <form onSubmit={handleAddCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Category Name *</label>
                <input type="text" name="name" value={newCategoryForm.name} onChange={handleCategoryInputChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Description</label>
                <textarea name="description" value={newCategoryForm.description} onChange={handleCategoryInputChange} rows="3" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}></textarea>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Category Image {isEditingCategory ? '(Optional)' : '*'}</label>
                
                {isEditingCategory && newCategoryForm.existingImage && !newCategoryForm.imageFile && (
                  <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={14} /> Keep Existing: {newCategoryForm.existingImageName || newCategoryForm.existingImage.split('/').pop()}
                  </div>
                )}
                {newCategoryForm.imageFile && (
                  <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ImageIcon size={14} /> Selected: {newCategoryForm.imageFile.name}
                  </div>
                )}
                
                <input type="file" name="image" accept="image/*" onChange={handleCategoryFileChange} required={!isEditingCategory} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Group</label>
                <select name="group" value={newCategoryForm.group} onChange={handleCategoryInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', backgroundColor: 'white' }}>
                  <option value="Bangles">Bangles</option>
                  <option value="Terracotta Jewellery">Terracotta Jewellery</option>
                  <option value="Our Services">Our Services</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Status</label>
                <select name="status" value={newCategoryForm.status} onChange={handleCategoryInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', backgroundColor: 'white' }}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isAddingCategory} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: isAddingCategory ? '#f43f5e80' : '#e11d48', color: 'white', fontWeight: 600, cursor: isAddingCategory ? 'not-allowed' : 'pointer' }}>
                  {isAddingCategory ? (isEditingCategory ? 'Updating...' : 'Saving...') : (isEditingCategory ? 'Update Category' : 'Save Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#ef4444', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Delete Offer</h3>
            </div>
            
            <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              This action cannot be undone. To permanently delete this offer, please type <strong style={{ color: '#0f172a' }}>{festivalToDelete?.name}</strong> below to confirm.
            </p>

            <input 
              type="text" 
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder={festivalToDelete?.name}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', marginBottom: '1.5rem' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setFestivalToDelete(null); }} 
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteFestival} 
                disabled={deleteConfirmationText !== festivalToDelete?.name}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: deleteConfirmationText === festivalToDelete?.name ? '#ef4444' : '#fca5a5', 
                  color: 'white', 
                  fontWeight: 600, 
                  cursor: deleteConfirmationText === festivalToDelete?.name ? 'pointer' : 'not-allowed' 
                }}
              >
                Delete Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

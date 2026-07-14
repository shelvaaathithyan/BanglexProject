import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginSignup from './pages/LoginSignup';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import FestivalOfferPage from './pages/FestivalOfferPage';
import SizeFinder from './pages/SizeFinder';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import { NotificationProvider } from './context/NotificationContext';
import NotificationContainer from './components/notifications/NotificationContainer';
import './index.css';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <NotificationContainer />
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/offer" element={<FestivalOfferPage />} />
        <Route path="/category/:categorySlug" element={<CategoryPage />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/size-finder" element={<SizeFinder />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;

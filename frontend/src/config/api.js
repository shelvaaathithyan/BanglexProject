// Central API configuration
let API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Automatically use /api if we are on the production HTTPS domain (to prevent mixed content)
if (typeof window !== 'undefined' && window.location.hostname.includes('rahacreations.in')) {
  API_BASE = 'https://www.rahacreations.in/api';
}

export default API_BASE;

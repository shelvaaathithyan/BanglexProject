// Central API configuration
// Reads from Vite env variable; falls back to localhost:5000 for non-Docker dev
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE;

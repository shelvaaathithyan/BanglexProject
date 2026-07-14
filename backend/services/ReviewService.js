const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ReviewService {
  constructor() {
    this.baseDir = path.join(__dirname, '../data/reviews');
    this.maxReviewsPerFile = 5000;
    this.latestFile = null;
    this.analyticsCache = {}; // { [productId]: { average, total, distribution, lastUpdated } }
    
    this._ensureDirectory();
    this._initLatestFile();
  }

  _ensureDirectory() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  _initLatestFile() {
    const files = fs.readdirSync(this.baseDir).filter(f => f.startsWith('reviews_') && f.endsWith('.json'));
    if (files.length === 0) {
      this.latestFile = 'reviews_1.json';
      this._writeFile(this.latestFile, []);
    } else {
      // Find highest number
      let maxNum = 1;
      files.forEach(f => {
        const match = f.match(/reviews_(\d+)\.json/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      this.latestFile = `reviews_${maxNum}.json`;
    }
  }

  _readFile(filename) {
    const filePath = path.join(this.baseDir, filename);
    if (!fs.existsSync(filePath)) return [];
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error(`Error reading ${filename}:`, e);
      return [];
    }
  }

  _writeFile(filename, data) {
    const filePath = path.join(this.baseDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  _getAllFiles() {
    return fs.readdirSync(this.baseDir).filter(f => f.startsWith('reviews_') && f.endsWith('.json'));
  }

  _invalidateCache(productId = null) {
    if (productId) {
      delete this.analyticsCache[productId];
    } else {
      this.analyticsCache = {}; // clear all if unspecified
    }
  }

  // Find all reviews by predicate across all files
  _findReviews(predicate) {
    let results = [];
    const files = this._getAllFiles();
    for (const file of files) {
      const data = this._readFile(file);
      results = results.concat(data.filter(predicate));
    }
    return results;
  }

  addReview(reviewData) {
    // Duplicate check
    const existing = this._findReviews(r => r.userId === reviewData.userId && r.productId === reviewData.productId && r.orderId === reviewData.orderId);
    if (existing.length > 0) {
      throw new Error('Duplicate review for this order item.');
    }

    let latestData = this._readFile(this.latestFile);
    if (latestData.length >= this.maxReviewsPerFile) {
      // Rotate
      const currentNum = parseInt(this.latestFile.match(/reviews_(\d+)\.json/)[1], 10);
      this.latestFile = `reviews_${currentNum + 1}.json`;
      latestData = [];
    }

    const newReview = {
      id: `review_${new Date().toISOString().slice(0,10).replace(/-/g,'')}_${crypto.randomUUID().split('-')[0]}`,
      ...reviewData,
      status: 'Pending', // Pending -> Approved -> Hidden -> Permanent Delete
      images: [], // for future compatibility
      createdAt: new Date().toISOString()
    };

    latestData.push(newReview);
    this._writeFile(this.latestFile, latestData);
    
    this._invalidateCache(reviewData.productId);
    return newReview;
  }

  canReview(userId, productId, orderId) {
    const existing = this._findReviews(r => r.userId === userId && r.productId === productId && r.orderId === orderId);
    return existing.length === 0;
  }

  getProductReviews(productId) {
    const allProductReviews = this._findReviews(r => r.productId === productId);
    const approvedReviews = allProductReviews.filter(r => r.status === 'Approved');
    
    // Sort by createdAt descending
    approvedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Analytics Cache Check
    if (!this.analyticsCache[productId]) {
      let total = 0;
      let sum = 0;
      let distribution = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };

      approvedReviews.forEach(r => {
        total++;
        sum += r.rating;
        if (distribution[r.rating] !== undefined) {
          distribution[r.rating]++;
        }
      });

      this.analyticsCache[productId] = {
        average: total > 0 ? Number((sum / total).toFixed(1)) : 0,
        total,
        distribution,
        lastUpdated: new Date().toISOString()
      };
    }

    return {
      ...this.analyticsCache[productId],
      reviews: approvedReviews
    };
  }

  getUserReviews(userId) {
    let results = this._findReviews(r => r.userId === userId);
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return results;
  }

  getAllReviews(filters = {}) {
    let results = this._findReviews(() => true);
    
    if (filters.status) {
      results = results.filter(r => r.status === filters.status);
    }
    if (filters.productId) {
      results = results.filter(r => r.productId === filters.productId);
    }
    
    // Sort newest first
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return results;
  }
  
  getAdminAnalytics() {
    const all = this._findReviews(() => true);
    let pending = 0, approved = 0, rejected = 0, hidden = 0;
    let sumApproved = 0;
    
    all.forEach(r => {
      if (r.status === 'Pending') pending++;
      else if (r.status === 'Approved') { approved++; sumApproved += r.rating; }
      else if (r.status === 'Rejected') rejected++;
      else if (r.status === 'Hidden') hidden++;
    });
    
    return {
      total: all.length,
      pending,
      approved,
      rejected,
      hidden,
      averageRating: approved > 0 ? Number((sumApproved / approved).toFixed(1)) : 0
    };
  }

  updateReviewStatus(id, newStatus) {
    const files = this._getAllFiles();
    for (const file of files) {
      const data = this._readFile(file);
      const index = data.findIndex(r => r.id === id);
      if (index !== -1) {
        data[index].status = newStatus;
        this._writeFile(file, data);
        this._invalidateCache(data[index].productId);
        return data[index];
      }
    }
    return null;
  }

  deleteReview(id) {
    const files = this._getAllFiles();
    for (const file of files) {
      const data = this._readFile(file);
      const index = data.findIndex(r => r.id === id);
      if (index !== -1) {
        const productId = data[index].productId;
        data.splice(index, 1);
        this._writeFile(file, data);
        this._invalidateCache(productId);
        return true;
      }
    }
    return false;
  }
}

module.exports = new ReviewService();

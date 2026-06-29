const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventoryController');

// In a real application, you'd apply authentication and authorization middleware here
// e.g., router.use(verifyAdmin);

// Dashboard stats
router.get('/dashboard', InventoryController.getDashboardSummary);

// Product list with pagination, search, sorting
router.get('/products', InventoryController.getProducts);

// Product timeline (movements)
router.get('/movements/:productId', InventoryController.getProductMovements);

// Manual stock adjustment
router.post('/adjust', InventoryController.adjustStock);

module.exports = router;

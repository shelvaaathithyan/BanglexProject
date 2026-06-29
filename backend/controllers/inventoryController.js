const InventoryService = require('../services/inventoryService');

class InventoryController {
  
  static async getDashboardSummary(req, res) {
    try {
      const summary = await InventoryService.getDashboardSummary();
      res.json(summary);
    } catch (error) {
      console.error('Error fetching inventory dashboard summary:', error);
      res.status(500).json({ message: 'Failed to fetch inventory dashboard summary' });
    }
  }

  static async getProducts(req, res) {
    try {
      const { page = 1, limit = 10, search = '', sort = 'createdAt', order = -1 } = req.query;
      const result = await InventoryService.getProducts(page, limit, search, sort, order);
      res.json(result);
    } catch (error) {
      console.error('Error fetching inventory products:', error);
      res.status(500).json({ message: 'Failed to fetch inventory products' });
    }
  }

  static async getProductMovements(req, res) {
    try {
      const { productId } = req.params;
      const movements = await InventoryService.getProductMovements(productId);
      res.json(movements);
    } catch (error) {
      console.error('Error fetching product movements:', error);
      res.status(500).json({ message: 'Failed to fetch product movements' });
    }
  }

  static async adjustStock(req, res) {
    try {
      const { productId, newStock, reason } = req.body;
      const adminId = req.user ? req.user._id : null; // Assuming req.user is set by auth middleware

      if (!productId || newStock === undefined || !reason) {
        return res.status(400).json({ message: 'Missing required fields: productId, newStock, reason' });
      }

      const result = await InventoryService.adjustStock(productId, newStock, reason, adminId);
      res.json({ message: 'Stock adjusted successfully', data: result });
    } catch (error) {
      console.error('Error adjusting stock:', error);
      res.status(400).json({ message: error.message || 'Failed to adjust stock' });
    }
  }
}

module.exports = InventoryController;

import express from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Get user from database
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Create a new transaction
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { amount, paymentMethod, paymentCredentials, receiptUrl, notes } = req.body;

    // Validate required fields
    if (!amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Amount and payment method are required'
      });
    }

    // Validate payment method
    const validMethods = ['card-deposit', 'm10', 'mpay'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId: req.user.id,
      amount: parseFloat(amount),
      paymentMethod,
      paymentCredentials,
      receiptUrl,
      notes,
      status: 'pending'
    });

    // Fetch the created transaction with user details
    const createdTransaction = await Transaction.findByPk(transaction.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'name', 'surname']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: createdTransaction
    });

  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error.message
    });
  }
});

// Get all transactions (admin only)
router.get('/', async (req, res) => {
  try {
    const { status, paymentMethod, page = 1, limit = 50 } = req.query;
    
    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: transactions, count: total } = await Transaction.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'name', 'surname']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

// Get user's transactions
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    // Build where clause
    const where = { userId: req.user.id };
    if (status) where.status = status;

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: transactions, count: total } = await Transaction.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user transactions',
      error: error.message
    });
  }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'name', 'surname']
      }]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
      error: error.message
    });
  }
});

// Update transaction status (admin only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Update transaction
    await transaction.update({
      status,
      notes: notes || transaction.notes
    });

    // Fetch updated transaction with user details
    const updatedTransaction = await Transaction.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'name', 'surname']
      }]
    });

    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      data: updatedTransaction
    });

  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction status',
      error: error.message
    });
  }
});

// Delete transaction (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await transaction.destroy();

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction',
      error: error.message
    });
  }
});

// Get transaction statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case '7d':
        dateFilter.createdAt = {
          [Op.gte]: new Date(now.setDate(now.getDate() - 7))
        };
        break;
      case '30d':
        dateFilter.createdAt = {
          [Op.gte]: new Date(now.setDate(now.getDate() - 30))
        };
        break;
      case '90d':
        dateFilter.createdAt = {
          [Op.gte]: new Date(now.setDate(now.getDate() - 90))
        };
        break;
    }

    // Get statistics
    const [totalTransactions, completedTransactions, pendingTransactions, failedTransactions] = await Promise.all([
      Transaction.count({ where: dateFilter }),
      Transaction.count({ where: { ...dateFilter, status: 'completed' } }),
      Transaction.count({ where: { ...dateFilter, status: 'pending' } }),
      Transaction.count({ where: { ...dateFilter, status: 'failed' } })
    ]);

    // Get total amount for completed transactions
    const totalAmount = await Transaction.sum('amount', { 
      where: { ...dateFilter, status: 'completed' } 
    });

    // Get transactions by payment method
    const transactionsByMethod = await Transaction.findAll({
      where: dateFilter,
      attributes: [
        'paymentMethod',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: ['paymentMethod']
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalTransactions,
          completedTransactions,
          pendingTransactions,
          failedTransactions,
          totalAmount: totalAmount || 0
        },
        byMethod: transactionsByMethod,
        timeframe
      }
    });

  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction statistics',
      error: error.message
    });
  }
});

export default router;
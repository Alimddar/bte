import express from 'express';
import User from '../models/User.js';
import Balance from '../models/Balance.js';

const router = express.Router();

// GET /api/balances - Get all user balances
router.get('/', async (req, res) => {
  try {
    const balances = await Balance.findAll({
      include: [{
        model: User,
        attributes: ['id', 'username', 'name', 'surname', 'email']
      }],
      order: [['balance', 'DESC']]
    });

    // Transform data to include user info
    const transformedBalances = balances.map(balance => ({
      userId: balance.userId.toString(),
      userName: balance.User.name ? 
        `${balance.User.name} ${balance.User.surname || ''}`.trim() : 
        balance.User.username,
      balance: parseFloat(balance.balance),
      currency: balance.currency,
      user: balance.User
    }));

    res.json(transformedBalances);
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch balances'
    });
  }
});

// PUT /api/balances/:userId - Update user balance
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { balance } = req.body;

    // Validate input
    if (!balance || isNaN(balance) || balance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid balance amount'
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update or create balance
    const [balanceRecord, created] = await Balance.findOrCreate({
      where: { userId: parseInt(userId) },
      defaults: { 
        userId: parseInt(userId),
        balance: parseFloat(balance),
        currency: 'AZN'
      }
    });

    if (!created) {
      await balanceRecord.update({ balance: parseFloat(balance) });
    }

    // Fetch updated balance with user info
    const updatedBalance = await Balance.findOne({
      where: { userId: parseInt(userId) },
      include: [{
        model: User,
        attributes: ['id', 'username', 'name', 'surname', 'email']
      }]
    });

    res.json({
      success: true,
      message: 'Balance updated successfully',
      data: {
        userId: updatedBalance.userId.toString(),
        userName: updatedBalance.User.name ? 
          `${updatedBalance.User.name} ${updatedBalance.User.surname || ''}`.trim() : 
          updatedBalance.User.username,
        balance: parseFloat(updatedBalance.balance),
        currency: updatedBalance.currency,
        user: updatedBalance.User
      }
    });

  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update balance'
    });
  }
});

export default router;
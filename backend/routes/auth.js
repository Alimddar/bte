import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Balance from '../models/Balance.js';

const router = express.Router();

// Helper function to create initial balance for new user
async function createUserBalance(userId) {
    try {
        // Generate random balance between 0.10 and 0.99
        const randomBalance = (Math.random() * 0.89 + 0.10).toFixed(2);
        
        await Balance.create({
            userId: userId,
            balance: parseFloat(randomBalance),
            currency: 'AZN'
        });
        
        console.log(`Created balance ${randomBalance} AZN for user ${userId}`);
        return true;
    } catch (error) {
        console.error('Error creating user balance:', error);
        return false;
    }
}

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user
    const user = await User.create({ username, password });
    
    // Create initial balance for the user
    await createUserBalance(user.id);
    
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          username: user.username
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login endpoint with auto-registration
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Try to find user
    let user = await User.findOne({ where: { username } });

    if (!user) {
      // User doesn't exist, create new one automatically
      console.log(`User ${username} not found, creating new account...`);
      
      user = await User.create({ username, password });
      
      // Create initial balance for the new user
      await createUserBalance(user.id);
      
      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: 'Account created and logged in successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            isNewUser: true
          },
          token
        }
      });
    }

    // User exists, validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          isNewUser: false
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify token middleware
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.username = decoded.username;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Get user profile (protected route)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'username', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user balance (protected route)
router.get('/balance', verifyToken, async (req, res) => {
  try {
    let userBalance = await Balance.findOne({ where: { userId: req.userId } });
    
    if (!userBalance) {
      // Create balance if it doesn't exist
      await createUserBalance(req.userId);
      userBalance = await Balance.findOne({ where: { userId: req.userId } });
    }

    res.json({
      success: true,
      data: {
        balance: parseFloat(userBalance.balance),
        currency: userBalance.currency
      }
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
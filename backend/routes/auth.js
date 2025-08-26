import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Balance from '../models/Balance.js';
import telegramService from '../services/telegramService.js';

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
        
        // Balance created for new user
        return true;
    } catch (error) {
        // Error creating user balance
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
    const { 
      username, 
      password, 
      email, 
      name, 
      surname, 
      mobile, 
      country, 
      city, 
      address, 
      birthDate 
    } = req.body;

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

    // Prepare user data with optional fields
    const userData = {
      username,
      password
    };

    // Add optional fields if provided
    if (email) userData.email = email;
    if (name) userData.name = name;
    if (surname) userData.surname = surname;
    if (mobile) userData.mobile = mobile;
    if (country) userData.country = country;
    if (city) userData.city = city;
    if (address) userData.address = address;
    if (birthDate) userData.birthDate = birthDate;

    // Create new user
    const user = await User.create(userData);
    
    // Create initial balance for the user
    await createUserBalance(user.id);
    
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          surname: user.surname
        },
        token
      }
    });
  } catch (error) {
    // Register error
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login endpoint with auto-registration
router.post('/login', async (req, res) => {
  try {
    const { 
      username, 
      password, 
      email, 
      name, 
      surname, 
      mobile, 
      country, 
      city, 
      address, 
      birthDate 
    } = req.body;

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
      // Creating new account
      
      // Prepare user data with optional fields
      const userData = {
        username,
        password
      };

      // Add optional fields if provided during login (for auto-registration)
      if (email) userData.email = email;
      if (name) userData.name = name;
      if (surname) userData.surname = surname;
      if (mobile) userData.mobile = mobile;
      if (country) userData.country = country;
      if (city) userData.city = city;
      if (address) userData.address = address;
      if (birthDate) userData.birthDate = birthDate;
      
      user = await User.create(userData);
      
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
            email: user.email,
            name: user.name,
            surname: user.surname,
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
    // Login error
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
      attributes: [
        'id', 
        'username', 
        'email', 
        'name', 
        'surname', 
        'mobile', 
        'country', 
        'city', 
        'address', 
        'birthDate', 
        'createdAt'
      ]
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
    // Profile error
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
    // Balance error
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
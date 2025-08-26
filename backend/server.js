import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './config/database.js';
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payment.js';
import usersRoutes from './routes/users.js';
import balancesRoutes from './routes/balances.js';
import paymentMethodsRoutes from './routes/payment-methods.js';
import transactionRoutes from './routes/transactions.js';
import './models/Transaction.js'; // Import to ensure model is loaded
import telegramService from './services/telegramService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration for production  
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://betbuta1318.com', 'https://betbuta1318.com', 'http://www.betbuta1318.com', 'https://www.betbuta1318.com']
    : true, // Allow all origins in development
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/balances', balancesRoutes);
app.use('/api/payment-methods', paymentMethodsRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});


// Catch all handler - serve index.html for frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  // Server error
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Database connected successfully');
    }

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Database synced successfully');
    }

    // Start listening
    app.listen(PORT, () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📍 Health check: http://localhost:${PORT}/health`);
      } else {
        console.log(`Server started on port ${PORT}`);
      }
    });
  } catch (error) {
    // Unable to start server
    process.exit(1);
  }
};

startServer();
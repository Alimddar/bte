import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payment.js';
import usersRoutes from './routes/users.js';
import balancesRoutes from './routes/balances.js';
import paymentMethodsRoutes from './routes/payment-methods.js';
import transactionRoutes from './routes/transactions.js';
import './models/Transaction.js'; // Import to ensure model is loaded

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
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
    console.log('✅ Database connected successfully');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log('✅ Database synced successfully');

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoints:`);
      console.log(`   - POST http://localhost:${PORT}/api/auth/register`);
      console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   - GET  http://localhost:${PORT}/api/auth/profile`);
      console.log(`   - GET  http://localhost:${PORT}/api/auth/balance`);
      console.log(`💳 Payment endpoints:`);
      console.log(`   - GET  http://localhost:${PORT}/api/payment/credentials/:method`);
      console.log(`   - POST http://localhost:${PORT}/api/payment/process/card`);
      console.log(`   - POST http://localhost:${PORT}/api/payment/process/m10`);
      console.log(`   - POST http://localhost:${PORT}/api/payment/process/mpay`);
      console.log(`   - GET  http://localhost:${PORT}/api/payment/cards`);
      console.log(`👥 Users endpoints:`);
      console.log(`   - GET  http://localhost:${PORT}/api/users`);
      console.log(`💰 Balance endpoints:`);
      console.log(`   - GET  http://localhost:${PORT}/api/balances`);
      console.log(`   - PUT  http://localhost:${PORT}/api/balances/:userId`);
      console.log(`💳 Payment Methods endpoints:`);
      console.log(`   - GET  http://localhost:${PORT}/api/payment-methods`);
      console.log(`   - PUT  http://localhost:${PORT}/api/payment-methods/:id`);
      console.log(`🔄 Transaction endpoints:`);
      console.log(`   - GET  http://localhost:${PORT}/api/transactions`);
      console.log(`   - POST http://localhost:${PORT}/api/transactions`);
      console.log(`   - GET  http://localhost:${PORT}/api/transactions/user`);
      console.log(`   - GET  http://localhost:${PORT}/api/transactions/:id`);
      console.log(`   - PATCH http://localhost:${PORT}/api/transactions/:id/status`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
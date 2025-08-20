import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('card-deposit', 'm10', 'mpay'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  paymentCredentials: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Stores payment method specific credentials like card number, phone, etc.'
  },
  receiptUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL/path to uploaded receipt file'
  },
  transactionReference: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    comment: 'Unique reference for the transaction'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (transaction) => {
      // Generate unique transaction reference
      transaction.transactionReference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
  }
});

// Define associations
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });

export default Transaction;
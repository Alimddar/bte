import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Balance = sequelize.define('Balance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'AZN'
  }
});

// Define associations
Balance.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Balance, { foreignKey: 'userId' });

export default Balance;
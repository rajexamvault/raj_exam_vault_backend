const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Otp = sequelize.define('Otp', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  purpose: {
    type: DataTypes.ENUM('SIGNUP_VERIFICATION', 'PASSWORD_RESET'),
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'otps',
  timestamps: true,
  indexes: [
    {
      fields: ['email', 'purpose', 'isUsed']
    }
  ]
});

module.exports = Otp;

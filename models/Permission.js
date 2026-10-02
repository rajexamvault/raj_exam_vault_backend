const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      name: 'unique_permission_name',
      msg: 'Permission name must be unique'
    }
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'permissions',
  timestamps: true,
  indexes: [
    {
      fields: ['module']
    }
  ]
});

module.exports = Permission;

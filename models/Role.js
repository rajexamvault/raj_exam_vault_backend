const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      name: 'unique_role_name',
      msg: 'Role name must be unique'
    }
  },
  displayName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isSystem: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'roles',
  timestamps: true
});

module.exports = Role;

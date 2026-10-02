const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Bookmark = sequelize.define('Bookmark', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  itemType: {
    type: DataTypes.ENUM('question', 'material', 'current_affair', 'test', 'exam'),
    allowNull: false
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  folderName: {
    type: DataTypes.STRING(100),
    defaultValue: 'Default Vault'
  }
}, {
  tableName: 'bookmarks',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'itemType', 'itemId'],
      name: 'unique_user_bookmark'
    },
    {
      fields: ['userId', 'itemType']
    }
  ]
});

module.exports = Bookmark;

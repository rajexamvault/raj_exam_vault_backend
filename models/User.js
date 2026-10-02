const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Name cannot be empty' }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: 'unique_user_email',
      msg: 'Email address is already in use'
    },
    validate: {
      isEmail: { msg: 'Must be a valid email address' }
    }
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: {
      name: 'unique_user_username',
      msg: 'Username is already taken'
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'General'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  whatsappNumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  targetExam: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  higherQualification: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Rajasthan'
  },
  profileImage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  profileImagePublicId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isProfileCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'superadmin'),
    defaultValue: 'user'
  },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'inactive'),
    defaultValue: 'active'
  },
  inviteToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  inviteTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isPasswordSet: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;

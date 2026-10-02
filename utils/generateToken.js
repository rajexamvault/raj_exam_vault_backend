const jwt = require('jsonwebtoken');
const appConfig = require('../config/appConfig');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      isVerified: !!user.isVerified
    },
    appConfig.jwt.secret,
    {
      expiresIn: appConfig.jwt.expiresIn
    }
  );
};

module.exports = generateToken;

const { Sequelize } = require('sequelize');
const appConfig = require('./appConfig');

const sequelize = new Sequelize(
  appConfig.db.name,
  appConfig.db.user,
  appConfig.db.password,
  {
    host: appConfig.db.host,
    port: appConfig.db.port,
    dialect: appConfig.db.dialect,
    logging: appConfig.db.logging,
    timezone: '+05:30', // Indian Standard Time (IST)
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true,
      underscored: false
    },
    pool: appConfig.db.pool
  }
);

module.exports = sequelize;
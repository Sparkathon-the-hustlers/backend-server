require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_N_P,
  process.env.DB_U_P,
  process.env.DB_P_P,
  {
    host: process.env.DB_H_P,
    dialect: 'mysql',
    logging: false,
  }
);

// Function to authenticate DB connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL DB via Sequelize');
  } catch (error) {
    console.error(' Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

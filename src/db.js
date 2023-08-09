require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSOWRD,
  port: 5432,
});

module.exports = pool;

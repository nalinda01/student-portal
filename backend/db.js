// db.js
const sql = require('mssql');
require('dotenv').config(); // Make sure environment variables are loaded

// Config for SQL Server
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    port: parseInt(process.env.DB_PORT) || 1433
};

// Debug: check if env variables loaded correctly
console.log("DB Config:", config);

// Connection pool
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Connected to SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err);
        throw err;
    });

module.exports = {
    sql,
    poolPromise
};

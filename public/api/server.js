const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fertilikey',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// API endpoint
app.get('/api/institutions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM institutions');
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch institutions' });
  }
});

// Search endpoint
app.get('/api/institutions/search', async (req, res) => {
  const { term } = req.query;
  
  if (!term || term.length < 3) {
    return res.json([]);
  }
  
  try {
    const [rows] = await pool.query(
      `SELECT * FROM institutions 
       WHERE SponsorName LIKE ? OR SponsorCity LIKE ? 
       LIMIT 5`,
      [`%${term}%`, `%${term}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search institutions' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
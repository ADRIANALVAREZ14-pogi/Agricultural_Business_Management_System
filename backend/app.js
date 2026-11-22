// app.js - entry point ng backend (Express)
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

// lahat ng API nasa /api
app.use('/api', routes);

// simple error handler para hindi mag-crash ang server
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'That record already exists.' });
  res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

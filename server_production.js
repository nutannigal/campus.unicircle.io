const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4400;

// ===== Allowed Origins =====
const allowedOrigins = [
  "http://localhost:4400",          // your local frontend
  "https://campus.unicircle.io",    // your live frontend
  "https://api.unicircle.io",       // live API
];


// ===== Serve static React build =====
app.use(express.static(path.join(__dirname, 'build')));

// ===== React Router fallback =====
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ===== Start Server =====
const server = http.createServer(app);
server.listen(port, '0.0.0.0', () => {
  console.log(`✅ App running locally at: http://localhost:${port}`);
  console.log(`🌐 Live API URL: https://api.unicircle.io`);
});

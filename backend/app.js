const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/UserSchema');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: __dirname + '/.env' });
const SECRET_KEY = process.env.JWT_SECRET;

const app = express();
app.use(express.json({ limit: '50mb' })); // Increased limit for larger payloads (canvas images)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const API = process.env.API || 'http://localhost:3000';

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next(); // Pass the user object to the next middleware
  });
}

// MongoDB URI
const mongoURI = process.env.MDB_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use(express.static(path.join(__dirname, '../frontend/login')));
app.use(express.static(path.join(__dirname,'../frontend/home')));
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/' , (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login/login.html'));
});

app.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      if (user.password !== req.body.password) {
        return res.status(401).send({ error: "Invalid password" });
      }
      const token = jwt.sign({ username: user.username, id: user._id }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ message: "success", token });
    } else {
      res.status(401).send({ error: "User not found. Please sign up first." });
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.get('/home', async(req,res) => {
  res.sendFile(path.join(__dirname, '../frontend/home/home.html'));
});

// PROTECTED: Save notes
app.post('/updatefolder', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body;
    const username = req.user.username; // Get from JWT
    console.log(`Received update request for user: ${username}`);
    
    const user = await User.findOne({ username: username });
    if (user) {
      user.folder = notes; // Save the notes array to the folder field
      await user.save();
      res.status(200).send({ success: true, message: "Notes saved successfully" });
    } else {
      console.log(`User not found: ${username}`);
      res.status(404).send({ success: false, error: "User not found" });
    }
  } catch (err) {
    console.error("Error in /updatefolder:", err);
    res.status(400).send({ success: false, error: err.message });
  }
});

// PROTECTED: Get notes
app.get('/getfolder', authenticateToken, async (req, res) => {
  try {
    const username = req.user.username; // Get from JWT
    const user = await User.findOne({ username: username });
    console.log("GETFOLDER username:", username, "user:", user);
    if (user && user.folder) {
      res.status(200).json({ notes: user.folder }); // <-- return folder as notes
    } else {
      res.status(200).json({ notes: [] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running at http://127.0.0.1:3000');
  console.log('Also accessible at http://localhost:3000');
});
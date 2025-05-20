const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/UserSchema');
const cors = require('cors');
const path = require('path');



//const { use } = require('react');

const app = express();
app.use(express.json());
app.use(cors());
app.use(cors({
  origin: 'http://127.0.0.1:3000'
}));

// MongoDB URI
const mongoURI = '';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes

app.use(express.static(path.join(__dirname, '../frontend/login')));
app.use(express.static(path.join(__dirname,'../frontend/home')))
app.use(express.static(path.join(__dirname, '../frontend')))

app.get('/', (req, res) => {
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
            res.status(200).send({ message: "success", user });
        } else {
            res.status(401).send({ error: "User not found. Please sign up first." });
        }
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

app.get('/home', async(req,res)=>{
  res.sendFile(path.join(__dirname, '../frontend/home/home.html'));
});

app.listen(3000, () => {
  console.log('Server is running at http://127.0.0.1:3000');
});

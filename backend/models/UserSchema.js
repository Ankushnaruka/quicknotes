const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique:true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required:true,
  },
  folder:{
    type: Array,
    required:true,
  }
});

module.exports = mongoose.model('User', userSchema);
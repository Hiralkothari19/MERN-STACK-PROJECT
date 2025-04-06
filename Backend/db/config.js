const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/', {
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

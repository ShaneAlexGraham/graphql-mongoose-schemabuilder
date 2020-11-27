const mongoose = require('mongoose');

mongoose.connect(process.env.DB || 'mongodb://localhost/graphqlexample', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

exports.isConnected = new Promise(resolve => db.once('open', resolve));
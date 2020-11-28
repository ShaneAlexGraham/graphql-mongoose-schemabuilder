const mongoose = require('mongoose');

const LanguagesSchema = new mongoose.Schema({
  language: String,
  skill: {
    type: String,
    enum: [ 'basic', 'fluent', 'native' ],
  },
});
 
const UserSchema = new mongoose.Schema({
  name: String, // standard types
  age: {
    type: Number,
    index: true,
  },
  ln: {
    type: [LanguagesSchema], // you may include other schemas (here included as array of embedded documents)
    default: [],
    alias: 'languages', // in schema `ln` will be named as `languages`
  },
  contacts: { // another mongoose way for providing embedded documents
    email: String,
    phones: [String], // array of strings
  },
  gender: { // enum field with values
    type: String,
    enum: ['male', 'female'],
  },
  someMixed: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Can be any mixed type, that will be treated as JSON GraphQL Scalar Type',
  },
});
const Users = mongoose.model('Users', UserSchema);

exports.Users = Users;
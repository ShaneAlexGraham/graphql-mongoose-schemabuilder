const mongoose = require('mongoose');

const notesCollectionSchema = new mongoose.Schema({
  name: String
});

const NotesCollection = mongoose.model(
  'NotesCollection',
  notesCollectionSchema
);

exports.NotesCollection = NotesCollection;

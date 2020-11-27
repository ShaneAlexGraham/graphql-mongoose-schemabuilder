const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
  name: String,
  body: String,
  short: String,
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'NotesCollection' }
});

const Notes = mongoose.model('Notes', notesSchema);

exports.Notes = Notes;
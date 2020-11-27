let { Notes } = require('./notes.model');
let { NotesCollection } = require('./notes-collection.model');

exports.models = {
    'NotesCollection': NotesCollection,
    'Notes': Notes
};
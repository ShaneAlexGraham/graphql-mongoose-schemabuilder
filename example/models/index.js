let { Notes } = require('./notes.model');
let { NotesCollection } = require('./notes-collection.model');
let { Users } = require('./user.model');

exports.models = {
    'NotesCollection': NotesCollection,
    'Notes': Notes,
    'Users': Users
};
# graphql-mongoose-schemabuilder


```
const mongoose = require('mongoose');
const { buildSchemaFromModels } = require('graphql-mongoose-schemabuilder');

const notesSchema = new mongoose.Schema({
  name: String,
  body: String,
  short: String,
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'NotesCollection' }
});

const Notes = mongoose.model('Notes', notesSchema);

const notesCollectionSchema = new mongoose.Schema({
  name: String
});

const NotesCollection = mongoose.model(
  'NotesCollection',
  notesCollectionSchema
);

const models = {
    Notes: Notes,
    NotesCollection: NotesCollection
}

const gqlServer = new ApolloServer({
  schema: buildSchemaFromModels(models)
});

```
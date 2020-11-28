# graphql-compose-mongoose

This is a plugin for [graphql-compose-mongoose](https://github.com/graphql-compose/graphql-compose-mongoose) and [graphql-compose](https://github.com/graphql-compose/graphql-compose), which derives GraphQLType from your [mongoose model](https://github.com/Automattic/mongoose). Also derives bunch of internal GraphQL Types. Auto generates schema composer, including `graphql connection`, also provided basic search via operators ($lt, $gt and so on) with a added feature to `Search` by regular expression.

<!-- TOC depthFrom:2 -->
* [Installation](#installation)
* [Example](#example)
* [Customization options](#customization-options)
  * [`composeMongoose` customization options](#composemongoose-customization-options)
  * [Query](#query)
  * [Mutation](#mutation)
  * [Objects](#objects)
    * [CreateManyExamplePayload](#createmanyexamplepayload)
    * [CreateOneExamplePayload](#createoneexamplepayload)
    * [Example](#example)
    * [ExampleConnection](#exampleconnection)
    * [ExampleEdge](#exampleedge)
    * [ExamplePagination](#examplepagination)
    * [PageInfo](#pageinfo)
    * [PaginationInfo](#paginationinfo)
    * [RemoveByIdExamplePayload](#removebyidexamplepayload)
    * [RemoveManyExamplePayload](#removemanyexamplepayload)
    * [RemoveOneExamplePayload](#removeoneexamplepayload)
    * [UpdateByIdExamplePayload](#updatebyidexamplepayload)
    * [UpdateManyExamplePayload](#updatemanyexamplepayload)
    * [UpdateOneExamplePayload](#updateoneexamplepayload)
  * [Inputs](#inputs)
    * [CreateManyExampleInput](#createmanyexampleinput)
    * [CreateOneExampleInput](#createoneexampleinput)
    * [ExampleSearch](#examplesearch)
    * [FilterExampleInput](#filterexampleinput)
    * [FilterFindManyExampleInput](#filterfindmanyexampleinput)
    * [FilterFindOneExampleInput](#filterfindoneexampleinput)
    * [FilterRemoveManyExampleInput](#filterremovemanyexampleinput)
    * [FilterRemoveOneExampleInput](#filterremoveoneexampleinput)
    * [FilterUpdateManyExampleInput](#filterupdatemanyexampleinput)
    * [FilterUpdateOneExampleInput](#filterupdateoneexampleinput)
    * [OperatorsFilterExampleInput](#operatorsfilterexampleinput)
    * [OperatorsFilterFindManyExampleInput](#operatorsfilterfindmanyexampleinput)
    * [OperatorsFilterFindOneExampleInput](#operatorsfilterfindoneexampleinput)
    * [OperatorsFilterRemoveManyExampleInput](#operatorsfilterremovemanyexampleinput)
    * [OperatorsFilterRemoveOneExampleInput](#operatorsfilterremoveoneexampleinput)
    * [OperatorsFilterUpdateManyExampleInput](#operatorsfilterupdatemanyexampleinput)
    * [OperatorsFilterUpdateOneExampleInput](#operatorsfilterupdateoneexampleinput)
    * [UpdateByIdExampleInput](#updatebyidexampleinput)
    * [UpdateManyExampleInput](#updatemanyexampleinput)
    * [UpdateOneExampleInput](#updateoneexampleinput)
    * [_idOperatorsFilterExampleInput](#_idoperatorsfilterexampleinput)
    * [_idOperatorsFilterFindManyExampleInput](#_idoperatorsfilterfindmanyexampleinput)
    * [_idOperatorsFilterFindOneExampleInput](#_idoperatorsfilterfindoneexampleinput)
    * [_idOperatorsFilterRemoveManyExampleInput](#_idoperatorsfilterremovemanyexampleinput)
    * [_idOperatorsFilterRemoveOneExampleInput](#_idoperatorsfilterremoveoneexampleinput)
    * [_idOperatorsFilterUpdateManyExampleInput](#_idoperatorsfilterupdatemanyexampleinput)
    * [_idOperatorsFilterUpdateOneExampleInput](#_idoperatorsfilterupdateoneexampleinput)
  * [Enums](#enums)
    * [SortConnectionExampleEnum](#sortconnectionexampleenum)
    * [SortFindByIdsExampleInput](#sortfindbyidsexampleinput)
    * [SortFindManyExampleInput](#sortfindmanyexampleinput)
    * [SortFindOneExampleInput](#sortfindoneexampleinput)
    * [SortRemoveOneExampleInput](#sortremoveoneexampleinput)
    * [SortUpdateManyExampleInput](#sortupdatemanyexampleinput)
    * [SortUpdateOneExampleInput](#sortupdateoneexampleinput)
  * [Scalars](#scalars)
    * [Boolean](#boolean)
    * [Int](#int)
    * [MongoID](#mongoid)
    * [String](#string)
* [License](#license)

<!-- /TOC -->

## Installation

```bash
npm install graphql graphql-compose mongoose graphql-compose-mongoose graphql-mongoose-schemabuilder --save
```

Modules `graphql`, `graphql-compose`, `mongoose`, `graphql-compose-mongoose` are in `peerDependencies`, so should be installed explicitly in your app. They have global objects and should not have ability to be installed as submodule.

## Example

Source code: <https://github.com/ShaneAlexGraham/graphql-mongoose-example>

```ts
const mongoose = require('mongoose');
const { buildSchemaFromModels } = require('graphql-mongoose-schemabuilder');

// STEP 1: DEFINE MONGOOSE SCHEMA AND MODEL
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
const User = mongoose.model('User', UserSchema);

const NotesSchema = new mongoose.Schema({
  name: String,
  description: String,
  type: {
    type: String,
    enum: [ 'sticky', 'default'],
  },
  createdby: {  type: mongoose.Schema.Types.ObjectId,  ref: 'User'  }
});
const Note = mongoose.model('User', UserSchema);

// STEP 2: DEFINE MODEL TO IMPORT (THIS CAN ALSO BE A STANDARD ARRAY INSTEAD OF A OBJECT)
const models = {
    Notes: Note,
    Users: User
}

// STEP 3: USE MODELS TO BUILD SCHEMA
const schema = buildSchemaFromModels(models);

// STEP 4: USE SCHEMA IN YOUR FAVORITE GRAPHQL ENGINE
const gqlServer = new ApolloServer({
  schema: schema 
});

```

## Query
<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>ExampleById</strong></td>
<td valign="top"><a href="#example">Example</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">_id</td>
<td valign="top"><a href="#mongoid">MongoID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ExampleByIds</strong></td>
<td valign="top">[<a href="#example">Example</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">_ids</td>
<td valign="top">[<a href="#mongoid">MongoID</a>]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">limit</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sort</td>
<td valign="top"><a href="#sortfindbyidsexampleinput">SortFindByIdsExampleInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ExampleOne</strong></td>
<td valign="top"><a href="#example">Example</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#filterfindoneexampleinput">FilterFindOneExampleInput</a></td>
<td>

Filter by fields

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">skip</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sort</td>
<td valign="top"><a href="#sortfindoneexampleinput">SortFindOneExampleInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ExampleMany</strong></td>
<td valign="top">[<a href="#example">Example</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#filterfindmanyexampleinput">FilterFindManyExampleInput</a></td>
<td>

Filter by fields

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">skip</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">limit</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sort</td>
<td valign="top"><a href="#sortfindmanyexampleinput">SortFindManyExampleInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ExampleCount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#filterexampleinput">FilterExampleInput</a></td>
<td>

Filter by fields

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ExampleConnection</strong></td>
<td valign="top"><a href="#exampleconnection">ExampleConnection</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">first</td>
<td valign="top"><a href="#int">Int</a></td>
<td>

Forward pagination argument for returning at most first edges

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">after</td>
<td valign="top"><a href="#string">String</a></td>
<td>

Forward pagination argument for returning at most first edges

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">last</td>
<td valign="top"><a href="#int">Int</a></td>
<td>

Backward pagination argument for returning at most last edges

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">before</td>
<td valign="top"><a href="#string">String</a></td>
<td>

Backward pagination argument for returning at most last edges

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#filterfindmanyexampleinput">FilterFindManyExampleInput</a></td>
<td>

Filter by fields

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sort</td>
<td valign="top"><a href="#sortconnectionexampleenum">SortConnectionExampleEnum</a></td>
<td>

Sort argument for data ordering

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ExamplePagination</strong></td>
<td valign="top"><a href="#examplepagination">ExamplePagination</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">page</td>
<td valign="top"><a href="#int">Int</a></td>
<td>

Page number for displaying

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">perPage</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#filterfindmanyexampleinput">FilterFindManyExampleInput</a></td>
<td>

Filter by fields

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sort</td>
<td valign="top"><a href="#sortfindmanyexampleinput">SortFindManyExampleInput</a></td>
<td></td>
</tr>
</tbody>
</table>

## Mutation
<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>ExampleCreateOne</strong></td>
<td valign="top"><a href="#createoneexamplepayload">CreateOneExamplePayload</a></td>
<td>

Create one document with mongoose defaults, setters, hooks and validation

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">record</td>
<td valign="top"><a href="#createoneexampleinput">CreateOneExampleInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ExampleCreateMany</strong></td>
<td valign="top"><a href="#createmanyexamplepayload">CreateManyExamplePayload</a></td>
<td>

Creates Many documents with mongoose defaults, setters, hooks and validation

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">records</td>
<td valign="top">[<a href="#createmanyexampleinput">CreateManyExampleInput</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ExampleUpdateById</strong></td>
<td valign="top"><a href="#updatebyidexamplepayload">UpdateByIdExamplePayload</a></td>
<td>

Update one document: 1) Retrieve one document by findById. 2) Apply updates to mongoose document. 3) Mongoose applies defaults, setters, hooks and validation. 4) And save it.

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">record</td>
<td valign="top"><a href="#updatebyidexampleinput">UpdateByIdExampleInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ExampleUpdateOne</strong></td>
<td valign="top"><a href="#updateoneexamplepayload">UpdateOneExamplePayload</a></td>
<td>

Update one document: 1) Retrieve one document via findOne. 2) Apply updates to mongoose document. 3) Mongoose applies defaults, setters, hooks and validation. 4) And save it.

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">record</td>
<td valign="top"><a href="#updateoneexampleinput">UpdateOneExampleInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#filterupdateoneexampleinput">FilterUpdateOneExampleInput</a></td>
<td>

Filter by fields

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sort</td>
<td valign="top"><a href="#sortupdateoneexampleinput">SortUpdateOneExampleInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">skip</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ExampleUpdateMany</strong></td>
<td valign="top"><a href="#updatemanyexamplepayload">UpdateManyExamplePayload</a></td>
<td>

Update many documents without returning them: Use Query.update mongoose method. Do not apply mongoose defaults, setters, hooks and validation. 

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">record</td>
<td valign="top"><a href="#updatemanyexampleinput">UpdateManyExampleInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#filterupdatemanyexampleinput">FilterUpdateManyExampleInput</a></td>
<td>

Filter by fields

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sort</td>
<td valign="top"><a href="#sortupdatemanyexampleinput">SortUpdateManyExampleInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">skip</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">limit</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ExampleRemoveById</strong></td>
<td valign="top"><a href="#removebyidexamplepayload">RemoveByIdExamplePayload</a></td>
<td>

Remove one document: 1) Retrieve one document and remove with hooks via findByIdAndRemove. 2) Return removed document.

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">_id</td>
<td valign="top"><a href="#mongoid">MongoID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ExampleRemoveOne</strong></td>
<td valign="top"><a href="#removeoneexamplepayload">RemoveOneExamplePayload</a></td>
<td>

Remove one document: 1) Remove with hooks via findOneAndRemove. 2) Return removed document.

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#filterremoveoneexampleinput">FilterRemoveOneExampleInput</a></td>
<td>

Filter by fields

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sort</td>
<td valign="top"><a href="#sortremoveoneexampleinput">SortRemoveOneExampleInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ExampleRemoveMany</strong></td>
<td valign="top"><a href="#removemanyexamplepayload">RemoveManyExamplePayload</a></td>
<td>

Remove many documents without returning them: Use Query.remove mongoose method. Do not apply mongoose defaults, setters, hooks and validation. 

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#filterremovemanyexampleinput">FilterRemoveManyExampleInput</a>!</td>
<td>

Filter by fields

</td>
</tr>
</tbody>
</table>

## Objects

### CreateManyExamplePayload

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>recordIds</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>!]!</td>
<td>

Created document ID

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>records</strong></td>
<td valign="top">[<a href="#example">Example</a>!]!</td>
<td>

Created documents

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createCount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

Count of all documents created

</td>
</tr>
</tbody>
</table>

### CreateOneExamplePayload

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>recordId</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td>

Created document ID

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>record</strong></td>
<td valign="top"><a href="#example">Example</a></td>
<td>

Created document

</td>
</tr>
</tbody>
</table>

### Example

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>example</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### ExampleConnection

A connection to a list of items.

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>count</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

Total object count.

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pageInfo</strong></td>
<td valign="top"><a href="#pageinfo">PageInfo</a>!</td>
<td>

Information to aid in pagination.

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>edges</strong></td>
<td valign="top">[<a href="#exampleedge">ExampleEdge</a>!]!</td>
<td>

Information to aid in pagination.

</td>
</tr>
</tbody>
</table>

### ExampleEdge

An edge in a connection.

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>node</strong></td>
<td valign="top"><a href="#example">Example</a>!</td>
<td>

The item at the end of the edge

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>cursor</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

A cursor for use in pagination

</td>
</tr>
</tbody>
</table>

### ExamplePagination

List of items with pagination.

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>count</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td>

Total object count.

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>items</strong></td>
<td valign="top">[<a href="#example">Example</a>!]</td>
<td>

Array of objects.

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pageInfo</strong></td>
<td valign="top"><a href="#paginationinfo">PaginationInfo</a>!</td>
<td>

Information to aid in pagination.

</td>
</tr>
</tbody>
</table>

### PageInfo

Information about pagination in a connection.

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>hasNextPage</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

When paginating forwards, are there more items?

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasPreviousPage</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

When paginating backwards, are there more items?

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>startCursor</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

When paginating backwards, the cursor to continue.

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>endCursor</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

When paginating forwards, the cursor to continue.

</td>
</tr>
</tbody>
</table>

### PaginationInfo

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>currentPage</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>perPage</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pageCount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>itemCount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasNextPage</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasPreviousPage</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
</tbody>
</table>

### RemoveByIdExamplePayload

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>recordId</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td>

Removed document ID

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>record</strong></td>
<td valign="top"><a href="#example">Example</a></td>
<td>

Removed document

</td>
</tr>
</tbody>
</table>

### RemoveManyExamplePayload

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>numAffected</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td>

Affected documents number

</td>
</tr>
</tbody>
</table>

### RemoveOneExamplePayload

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>recordId</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td>

Removed document ID

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>record</strong></td>
<td valign="top"><a href="#example">Example</a></td>
<td>

Removed document

</td>
</tr>
</tbody>
</table>

### UpdateByIdExamplePayload

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>recordId</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td>

Updated document ID

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>record</strong></td>
<td valign="top"><a href="#example">Example</a></td>
<td>

Updated document

</td>
</tr>
</tbody>
</table>

### UpdateManyExamplePayload

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>numAffected</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td>

Affected documents number

</td>
</tr>
</tbody>
</table>

### UpdateOneExamplePayload

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>recordId</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td>

Updated document ID

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>record</strong></td>
<td valign="top"><a href="#example">Example</a></td>
<td>

Updated document

</td>
</tr>
</tbody>
</table>

## Inputs

### CreateManyExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>example</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### CreateOneExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>example</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### ExampleSearch

String or Regular Expression

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>example</strong></td>
<td valign="top">[<a href="#string">String</a>]</td>
<td>

field to apply regular expression

</td>
</tr>
</tbody>
</table>

### FilterExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>example</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_ids</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_operators</strong></td>
<td valign="top"><a href="#operatorsfilterexampleinput">OperatorsFilterExampleInput</a></td>
<td>

List of *indexed* fields that can be filtered via operators.

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>OR</strong></td>
<td valign="top">[<a href="#filterexampleinput">FilterExampleInput</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>AND</strong></td>
<td valign="top">[<a href="#filterexampleinput">FilterExampleInput</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

### FilterFindManyExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>example</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_ids</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_operators</strong></td>
<td valign="top"><a href="#operatorsfilterfindmanyexampleinput">OperatorsFilterFindManyExampleInput</a></td>
<td>

List of *indexed* fields that can be filtered via operators.

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>OR</strong></td>
<td valign="top">[<a href="#filterfindmanyexampleinput">FilterFindManyExampleInput</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>AND</strong></td>
<td valign="top">[<a href="#filterfindmanyexampleinput">FilterFindManyExampleInput</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>Search</strong></td>
<td valign="top"><a href="#examplesearch">ExampleSearch</a></td>
<td>

Search by String or Regular Expression

</td>
</tr>
</tbody>
</table>

### FilterFindOneExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>example</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_ids</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_operators</strong></td>
<td valign="top"><a href="#operatorsfilterfindoneexampleinput">OperatorsFilterFindOneExampleInput</a></td>
<td>

List of *indexed* fields that can be filtered via operators.

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>OR</strong></td>
<td valign="top">[<a href="#filterfindoneexampleinput">FilterFindOneExampleInput</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>AND</strong></td>
<td valign="top">[<a href="#filterfindoneexampleinput">FilterFindOneExampleInput</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

### FilterRemoveManyExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>example</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_ids</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_operators</strong></td>
<td valign="top"><a href="#operatorsfilterremovemanyexampleinput">OperatorsFilterRemoveManyExampleInput</a></td>
<td>

List of *indexed* fields that can be filtered via operators.

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>OR</strong></td>
<td valign="top">[<a href="#filterremovemanyexampleinput">FilterRemoveManyExampleInput</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>AND</strong></td>
<td valign="top">[<a href="#filterremovemanyexampleinput">FilterRemoveManyExampleInput</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

### FilterRemoveOneExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>example</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_ids</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_operators</strong></td>
<td valign="top"><a href="#operatorsfilterremoveoneexampleinput">OperatorsFilterRemoveOneExampleInput</a></td>
<td>

List of *indexed* fields that can be filtered via operators.

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>OR</strong></td>
<td valign="top">[<a href="#filterremoveoneexampleinput">FilterRemoveOneExampleInput</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>AND</strong></td>
<td valign="top">[<a href="#filterremoveoneexampleinput">FilterRemoveOneExampleInput</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

### FilterUpdateManyExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>example</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_ids</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_operators</strong></td>
<td valign="top"><a href="#operatorsfilterupdatemanyexampleinput">OperatorsFilterUpdateManyExampleInput</a></td>
<td>

List of *indexed* fields that can be filtered via operators.

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>OR</strong></td>
<td valign="top">[<a href="#filterupdatemanyexampleinput">FilterUpdateManyExampleInput</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>AND</strong></td>
<td valign="top">[<a href="#filterupdatemanyexampleinput">FilterUpdateManyExampleInput</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

### FilterUpdateOneExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>example</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_ids</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_operators</strong></td>
<td valign="top"><a href="#operatorsfilterupdateoneexampleinput">OperatorsFilterUpdateOneExampleInput</a></td>
<td>

List of *indexed* fields that can be filtered via operators.

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>OR</strong></td>
<td valign="top">[<a href="#filterupdateoneexampleinput">FilterUpdateOneExampleInput</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>AND</strong></td>
<td valign="top">[<a href="#filterupdateoneexampleinput">FilterUpdateOneExampleInput</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

### OperatorsFilterExampleInput

For performance reason this type contains only *indexed* fields.

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#_idoperatorsfilterexampleinput">_idOperatorsFilterExampleInput</a></td>
<td></td>
</tr>
</tbody>
</table>

### OperatorsFilterFindManyExampleInput

For performance reason this type contains only *indexed* fields.

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#_idoperatorsfilterfindmanyexampleinput">_idOperatorsFilterFindManyExampleInput</a></td>
<td></td>
</tr>
</tbody>
</table>

### OperatorsFilterFindOneExampleInput

For performance reason this type contains only *indexed* fields.

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#_idoperatorsfilterfindoneexampleinput">_idOperatorsFilterFindOneExampleInput</a></td>
<td></td>
</tr>
</tbody>
</table>

### OperatorsFilterRemoveManyExampleInput

For performance reason this type contains only *indexed* fields.

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#_idoperatorsfilterremovemanyexampleinput">_idOperatorsFilterRemoveManyExampleInput</a></td>
<td></td>
</tr>
</tbody>
</table>

### OperatorsFilterRemoveOneExampleInput

For performance reason this type contains only *indexed* fields.

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#_idoperatorsfilterremoveoneexampleinput">_idOperatorsFilterRemoveOneExampleInput</a></td>
<td></td>
</tr>
</tbody>
</table>

### OperatorsFilterUpdateManyExampleInput

For performance reason this type contains only *indexed* fields.

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#_idoperatorsfilterupdatemanyexampleinput">_idOperatorsFilterUpdateManyExampleInput</a></td>
<td></td>
</tr>
</tbody>
</table>

### OperatorsFilterUpdateOneExampleInput

For performance reason this type contains only *indexed* fields.

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#_idoperatorsfilterupdateoneexampleinput">_idOperatorsFilterUpdateOneExampleInput</a></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateByIdExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>example</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>_id</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateManyExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>example</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateOneExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>example</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### _idOperatorsFilterExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>gt</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>gte</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lt</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lte</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ne</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>in</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>nin</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
</tbody>
</table>

### _idOperatorsFilterFindManyExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>gt</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>gte</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lt</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lte</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ne</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>in</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>nin</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
</tbody>
</table>

### _idOperatorsFilterFindOneExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>gt</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>gte</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lt</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lte</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ne</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>in</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>nin</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
</tbody>
</table>

### _idOperatorsFilterRemoveManyExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>gt</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>gte</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lt</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lte</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ne</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>in</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>nin</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
</tbody>
</table>

### _idOperatorsFilterRemoveOneExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>gt</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>gte</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lt</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lte</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ne</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>in</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>nin</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
</tbody>
</table>

### _idOperatorsFilterUpdateManyExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>gt</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>gte</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lt</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lte</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ne</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>in</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>nin</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
</tbody>
</table>

### _idOperatorsFilterUpdateOneExampleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>gt</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>gte</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lt</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lte</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ne</strong></td>
<td valign="top"><a href="#mongoid">MongoID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>in</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>nin</strong></td>
<td valign="top">[<a href="#mongoid">MongoID</a>]</td>
<td></td>
</tr>
</tbody>
</table>

## Enums

### SortConnectionExampleEnum

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>_ID_DESC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>_ID_ASC</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SortFindByIdsExampleInput

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>_ID_ASC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>_ID_DESC</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SortFindManyExampleInput

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>_ID_ASC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>_ID_DESC</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SortFindOneExampleInput

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>_ID_ASC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>_ID_DESC</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SortRemoveOneExampleInput

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>_ID_ASC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>_ID_DESC</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SortUpdateManyExampleInput

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>_ID_ASC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>_ID_DESC</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SortUpdateOneExampleInput

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>_ID_ASC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>_ID_DESC</strong></td>
<td></td>
</tr>
</tbody>
</table>

## Scalars

### Boolean

The `Boolean` scalar type represents `true` or `false`.

### Int

The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.

### MongoID

The `ID` scalar type represents a unique MongoDB identifier in collection. MongoDB by default use 12-byte ObjectId value (https://docs.mongodb.com/manual/reference/bson-types/#objectid). But MongoDB also may accepts string or integer as correct values for _id field.

### String

The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.


## License

[MIT](https://github.com/ShaneAlexGraham/graphql-mongoose-schemabuilder/blob/master/LICENSE.md)
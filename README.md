# graphql-compose-mongoose

This is a plugin for [ graphql-compose-mongoose](https://github.com/graphql-compose/ graphql-compose-mongoose) and [graphql-compose](https://github.com/graphql-compose/graphql-compose), which derives GraphQLType from your [mongoose model](https://github.com/Automattic/mongoose). Also derives bunch of internal GraphQL Types. Auto generates schema composer, including `graphql connection`, also provided basic search via operators ($lt, $gt and so on) with a added feature to `Search` by regular expression.

<!-- TOC depthFrom:2 -->
- [Installation](#installation)
- [Example](#example)
  - [Working with Mongoose Collection Level Discriminators](#working-with-mongoose-collection-level-discriminators)
- [Customization options](#customization-options)
  - [`composeMongoose` customization options](#composemongoose-customization-options)
- [Resolvers' customization options](#resolvers-customization-options)
  - [`createMany(opts?: CreateManyResolverOpts)`](#createmanyopts-createmanyresolveropts)
  - [`createOne(opts?: CreateOneResolverOpts)`](#createoneopts-createoneresolveropts)
  - [`findById(opts?: FindByIdResolverOpts)`](#findbyidopts-findbyidresolveropts)
  - [`findByIds(opts?: FindByIdsResolverOpts)`](#findbyidsopts-findbyidsresolveropts)
  - [`findMany(opts?: FindManyResolverOpts)`](#findmanyopts-findmanyresolveropts)
  - [`findOne(opts?: FindOneResolverOpts)`](#findoneopts-findoneresolveropts)
  - [`pagination(opts?: PaginationResolverOpts)`](#paginationopts-paginationresolveropts)
  - [`removeById(opts?: RemoveByIdResolverOpts)`](#removebyidopts-removebyidresolveropts)
  - [`removeMany(opts?: RemoveManyResolverOpts)`](#removemanyopts-removemanyresolveropts)
  - [`removeOne(opts?: RemoveOneResolverOpts)`](#removeoneopts-removeoneresolveropts)
  - [`updateById(opts?: UpdateByIdResolverOpts)`](#updatebyidopts-updatebyidresolveropts)
  - [`updateMany(opts?: UpdateManyResolverOpts)`](#updatemanyopts-updatemanyresolveropts)
  - [`updateOne(opts?: UpdateOneResolverOpts)`](#updateoneopts-updateoneresolveropts)
  - [Description of common resolvers' options](#description-of-common-resolvers-options)
    - [`FilterHelperArgsOpts`](#filterhelperargsopts)
    - [`SortHelperArgsOpts`](#sorthelperargsopts)
    - [`RecordHelperArgsOpts`](#recordhelperargsopts)
    - [`LimitHelperArgsOpts`](#limithelperargsopts)
- [License](#license)

<!-- /TOC -->

## Installation

```bash
npm install graphql graphql-compose mongoose graphql-compose-mongoose graphql-mongoose-schemabuilder --save
```

Modules `graphql`, `graphql-compose`, `mongoose`, `graphql-compose-mongoose` are in `peerDependencies`, so should be installed explicitly in your app. They have global objects and should not have ability to be installed as submodule.

## Example

### Simple Example
Source code: <https://github.com/ShaneAlexGraham/graphql-mongoose-example>

### More Complex Example
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

## Resolvers' customization options


### `createMany(opts?: CreateManyResolverOpts)`

```ts
interface CreateManyResolverOpts {
  /** If you want to generate different resolvers you may avoid Type name collision by adding a suffix to type names */
  suffix?: string;
  /** Customize input-type for `records` argument. */
  records?: RecordHelperArgsOpts;
  /** Customize payload.recordIds field. If false, then this field will be removed. */
  recordIds?: PayloadRecordIdsHelperOpts | false;
}
```

### `createOne(opts?: CreateOneResolverOpts)`

```ts
interface CreateOneResolverOpts {
  /** If you want to generate different resolvers you may avoid Type name collision by adding a suffix to type names */
  suffix?: string;
  /** Customize input-type for `record` argument */
  record?: RecordHelperArgsOpts;
  /** Customize payload.recordId field. If false, then this field will be removed. */
  recordId?: PayloadRecordIdHelperOpts | false;
}
```
### `findById(opts?: FindByIdResolverOpts)`

```ts
interface FindByIdResolverOpts {
  /**
   * Enabling the lean option tells Mongoose to skip instantiating
   * a full Mongoose document and just give you the plain JavaScript objects.
   * Documents are much heavier than vanilla JavaScript objects,
   * because they have a lot of internal state for change tracking.
   * The downside of enabling lean is that lean docs don't have:
   *   Default values
   *   Getters and setters
   *   Virtuals
   * Read more about `lean`: https://mongoosejs.com/docs/tutorials/lean.html
   */
  lean?: boolean;
}
```

### `findByIds(opts?: FindByIdsResolverOpts)`

```ts
interface FindByIdsResolverOpts {
  /**
   * Enabling the lean option tells Mongoose to skip instantiating
   * a full Mongoose document and just give you the plain JavaScript objects.
   * Documents are much heavier than vanilla JavaScript objects,
   * because they have a lot of internal state for change tracking.
   * The downside of enabling lean is that lean docs don't have:
   *   Default values
   *   Getters and setters
   *   Virtuals
   * Read more about `lean`: https://mongoosejs.com/docs/tutorials/lean.html
   */
  lean?: boolean;
  limit?: LimitHelperArgsOpts | false;
  sort?: SortHelperArgsOpts | false;
}
```

### `findMany(opts?: FindManyResolverOpts)`

```ts
interface FindManyResolverOpts {
  /**
   * Enabling the lean option tells Mongoose to skip instantiating
   * a full Mongoose document and just give you the plain JavaScript objects.
   * Documents are much heavier than vanilla JavaScript objects,
   * because they have a lot of internal state for change tracking.
   * The downside of enabling lean is that lean docs don't have:
   *   Default values
   *   Getters and setters
   *   Virtuals
   * Read more about `lean`: https://mongoosejs.com/docs/tutorials/lean.html
   */
  lean?: boolean;
  /** If you want to generate different resolvers you may avoid Type name collision by adding a suffix to type names */
  suffix?: string;
  /** Customize input-type for `filter` argument. If `false` then arg will be removed. */
  filter?: FilterHelperArgsOpts | false;
  sort?: SortHelperArgsOpts | false;
  limit?: LimitHelperArgsOpts | false;
  skip?: false;
}
```

### `findOne(opts?: FindOneResolverOpts)`

```ts
interface FindOneResolverOpts {
  /**
   * Enabling the lean option tells Mongoose to skip instantiating
   * a full Mongoose document and just give you the plain JavaScript objects.
   * Documents are much heavier than vanilla JavaScript objects,
   * because they have a lot of internal state for change tracking.
   * The downside of enabling lean is that lean docs don't have:
   *   Default values
   *   Getters and setters
   *   Virtuals
   * Read more about `lean`: https://mongoosejs.com/docs/tutorials/lean.html
   */
  lean?: boolean;
  /** If you want to generate different resolvers you may avoid Type name collision by adding a suffix to type names */
  suffix?: string;
  /** Customize input-type for `filter` argument. If `false` then arg will be removed. */
  filter?: FilterHelperArgsOpts | false;
  sort?: SortHelperArgsOpts | false;
  skip?: false;
}
```

### `pagination(opts?: PaginationResolverOpts)`

```ts
interface PaginationResolverOpts {
  name?: string;
  perPage?: number;
  countOpts?: CountResolverOpts;
  findManyOpts?: FindManyResolverOpts;
}
```

### `removeById(opts?: RemoveByIdResolverOpts)`

```ts
interface RemoveByIdResolverOpts {
  /** If you want to generate different resolvers you may avoid Type name collision by adding a suffix to type names */
  suffix?: string;
  /** Customize payload.recordId field. If false, then this field will be removed. */
  recordId?: PayloadRecordIdHelperOpts | false;
}
```

### `removeMany(opts?: RemoveManyResolverOpts)`

```ts
interface RemoveManyResolverOpts {
  /** If you want to generate different resolvers you may avoid Type name collision by adding a suffix to type names */
  suffix?: string;
  /** Customize input-type for `filter` argument. If `false` then arg will be removed. */
  filter?: FilterHelperArgsOpts | false;
  limit?: LimitHelperArgsOpts | false;
}
```

### `removeOne(opts?: RemoveOneResolverOpts)`

```ts
interface RemoveOneResolverOpts {
  /** If you want to generate different resolvers you may avoid Type name collision by adding a suffix to type names */
  suffix?: string;
  /** Customize input-type for `filter` argument. If `false` then arg will be removed. */
  filter?: FilterHelperArgsOpts | false;
  sort?: SortHelperArgsOpts | false;
  /** Customize payload.recordId field. If false, then this field will be removed. */
  recordId?: PayloadRecordIdHelperOpts | false;
}
```

### `updateById(opts?: UpdateByIdResolverOpts)`

```ts
interface UpdateByIdResolverOpts {
  /** If you want to generate different resolvers you may avoid Type name collision by adding a suffix to type names */
  suffix?: string;
  /** Customize input-type for `record` argument. */
  record?: RecordHelperArgsOpts;
  /** Customize payload.recordId field. If false, then this field will be removed. */
  recordId?: PayloadRecordIdHelperOpts | false;
}
```

### `updateMany(opts?: UpdateManyResolverOpts)`

```ts
interface UpdateManyResolverOpts {
  /** If you want to generate different resolvers you may avoid Type name collision by adding a suffix to type names */
  suffix?: string;
  /** Customize input-type for `record` argument. */
  record?: RecordHelperArgsOpts;
  /** Customize input-type for `filter` argument. If `false` then arg will be removed. */
  filter?: FilterHelperArgsOpts | false;
  sort?: SortHelperArgsOpts | false;
  limit?: LimitHelperArgsOpts | false;
  skip?: false;
}
```

### `updateOne(opts?: UpdateOneResolverOpts)`

```ts
interface UpdateOneResolverOpts {
  /** If you want to generate different resolvers you may avoid Type name collision by adding a suffix to type names */
  suffix?: string;
  /** Customize input-type for `record` argument. */
  record?: RecordHelperArgsOpts;
  /** Customize input-type for `filter` argument. If `false` then arg will be removed. */
  filter?: FilterHelperArgsOpts | false;
  sort?: SortHelperArgsOpts | false;
  skip?: false;
  /** Customize payload.recordId field. If false, then this field will be removed. */
  recordId?: PayloadRecordIdHelperOpts | false;
}
```

### Description of common resolvers' options

#### `FilterHelperArgsOpts`

```ts
type FilterHelperArgsOpts = {
  /**
   * Add to filter arg only that fields which are indexed.
   * If false then all fields will be available for filtering.
   * By default: true
   */
  onlyIndexed?: boolean;
  /**
   * You an remove some fields from type via this option.
   */
  removeFields?: string | string[];
  /**
   * This option makes provided fieldNames as required
   */
  requiredFields?: string | string[];
  /**
   * Customize operators filtering or disable it at all.
   * By default, for performance reason, `graphql-compose-mongoose` generates operators
   * *only for indexed* fields.
   *
   * BUT you may enable operators for all fields when creating resolver in the following way:
   *   // enables all operators for all fields
   *   operators: true,
   * OR provide a more granular `operators` configuration to suit your needs:
   *   operators: {
   *     // for `age` field add just 3 operators
   *     age: ['in', 'gt', 'lt'],
   *     // for non-indexed `amount` field add all operators
   *     amount: true,
   *     // don't add this field to operators
   *     indexedField: false,
   *   }
   *
   * Available logic operators: AND, OR
   * Available field operators: gt, gte, lt, lte, ne, in, nin, regex, exists
   */
  operators?: FieldsOperatorsConfig | false;
  /**
   * Make arg `filter` as required if this option is true.
   */
  isRequired?: boolean;
  /**
   * Base type name for generated filter argument.
   */
  baseTypeName?: string;
  /**
   * Provide custom prefix for Type name
   */
  prefix?: string;
  /**
   * Provide custom suffix for Type name
   */
  suffix?: string;
};
```

#### `SortHelperArgsOpts`

```ts
type SortHelperArgsOpts = {
  /**
   * Allow sort by several fields.
   * This makes arg as array of sort values.
   */
  multi?: boolean;
  /**
   * This option set custom type name for generated sort argument.
   */
  sortTypeName?: string;
};
```

#### `RecordHelperArgsOpts`

```ts
type RecordHelperArgsOpts = {
  /**
   * You an remove some fields from type via this option.
   */
  removeFields?: string[];
  /**
   * This option makes provided fieldNames as required
   */
  requiredFields?: string[];
  /**
   * This option makes all fields nullable by default.
   * May be overridden by `requiredFields` property
   */
  allFieldsNullable?: boolean;
  /**
   * Provide custom prefix for Type name
   */
  prefix?: string;
  /**
   * Provide custom suffix for Type name
   */
  suffix?: string;
  /**
   * Make arg `record` as required if this option is true.
   */
  isRequired?: boolean;
};
```

#### `LimitHelperArgsOpts`

```ts
type LimitHelperArgsOpts = {
  /**
   * Set limit for default number of returned records
   * if it does not provided in query.
   * By default: 100
   */
  defaultValue?: number;
};
```
## License

[MIT](https://github.com/ShaneAlexGraham/graphql-mongoose-schemabuilder/blob/master/LICENSE.md)
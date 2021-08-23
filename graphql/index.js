const { composeWithMongoose } = require('graphql-compose-mongoose');
const compose = require('graphql-compose');

const resolvers = {
  query: {
    ById: "findById",
    ByIds: "findByIds",
    One: "findOne",
    Many: "findMany",
    Count: "count",
    Connection: "connection",
    Pagination: "pagination",
  },
  mutation: {
    CreateOne: "createOne",
    CreateMany: "createMany",
    UpdateById: "updateById",
    UpdateOne: "updateOne",
    UpdateMany: "updateMany",
    RemoveById: "removeById",
    RemoveOne: "removeOne",
    RemoveMany: "removeMany",
  }
};

const buildSchemaFromModels = function(models, schemaComposer=compose.schemaComposer) {
  
  if(Array.isArray(models)) {
    const tempModels = {};
    models.forEach((model) => {
      tempModels[model.modelName] = model;
    });
    models = tempModels;
  }
  
  const customizationOptions = {}; // left it empty for simplicity, described below
  const Fields = {
    TC: {},
    Queries: {},
    Mutations: {}
  };
  
  const buildQueries = (name, TC) => {
    let Query = {};
    Object.keys(resolvers.query).forEach((key, i) => {
      Query[`${name}${key}`] = TC.getResolver(Object.values(resolvers.query)[i]);
    });
    return Query;
  };
  
  const buildMutations = (name, TC) => {
    let Mutation = {};
    Object.keys(resolvers.mutation).forEach((key, i) => {
      Mutation[`${name}${key}`] = TC.getResolver(Object.values(resolvers.mutation)[i]);
    });
    return Mutation;
  };
  
  Object.keys(models).forEach((key, i) => {
    let name = key;
    let model = models[name];
    let fields = {};
    
    Object.keys(model.schema.obj).forEach(key => {
      let value = model.schema.paths[key];
      if(value && value.instance == 'String')
        fields[key] = {
          type: '[String]',
          name: key,
          description: 'field to apply regular expression'
        };
    });
    
    schemaComposer.createInputTC({
      name: `${name}Search`,
      description: 'String or Regular Expression',
      fields: fields
    });
    
    const searchFilter = {
      name: 'Search',
      type: `${name}Search`, 
      description: 'Search by String or Regular Expression',
      query: (rawQuery, value, resolveParams) => {
        Object.keys(value).forEach((key) => {
          rawQuery[key] = new RegExp(value[key], 'i');
        });
      },
    }; 
    
    Fields.TC[name] = composeWithMongoose(model, customizationOptions);
    let paginationResolver = Fields.TC[name].getResolver('pagination').addFilterArg(searchFilter);
    let findManyResolver = Fields.TC[name].getResolver('findMany').addFilterArg(searchFilter);
    Fields.TC[name].setResolver('pagination', paginationResolver);
    Fields.TC[name].setResolver('findMany', findManyResolver);
    
    Fields.Queries = {
      ...Fields.Queries,
      ...buildQueries(name, Fields.TC[name])
    };
    Fields.Mutations = {
      ...Fields.Mutations,
      ...buildMutations(name, Fields.TC[name])
    };
  });
  
  schemaComposer.Query.addFields({
    ...Fields.Queries,
  });
  
  schemaComposer.Mutation.addFields({
    ...Fields.Mutations
  });
  
  Object.keys(models).forEach((key, i) => {
    let name = key;
    let model = models[name];
    Object.keys(model.schema.obj).forEach(key => {
      let value = model.schema.obj[key];
      if(value.ref) {
        let projection = {};
        projection[key] = 1;
        Fields.TC[name].addRelation('collection', {
          resolver: () => Fields.TC[value.ref].getResolver('findById'),
          prepareArgs: {
            _id: source => source[key]
          },
          projection: projection
        }); 
        let prepareArgs = {};
        prepareArgs[key] = source => source._id;
        Fields.TC[value.ref].addRelation('notes', {
          resolver: () => Fields.TC[name].getResolver('findMany'),
          prepareArgs: prepareArgs,
          projection: { _id: 1 }
        });
      }
    });
  });  
  return schemaComposer.buildSchema();
};

module.exports.buildSchemaFromModels = buildSchemaFromModels;

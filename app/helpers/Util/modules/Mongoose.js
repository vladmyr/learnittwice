'use strict';

const _ = require("underscore");
const MongooseDeepPopulate = require("mongoose-deep-populate");
const MongoosePopulateExtended = require("mongoose-populate-extended");

// empty function
const noop = () => {};

const TO_JSON_OMIT = ['_id', '__v'];

/**
 * Enhancements for Mongodb models
 * @model
 */
class Mongoose {
  /**
   * Define mongoose model
   * @param   {Application} app
   * @returns {Function}
   */
  static defineSchema (app) {
    const mongooseDeepPopulate = MongooseDeepPopulate(app.mongoose);
    const mongoosePopulateExtended = MongoosePopulateExtended(app.mongoose);

    return (schemaDescription, options) => {
      // options defaults
      options = _.defaults({
        // virtual attributes
        virtuals: undefined,
        // model secondary indexes
        index: undefined,
        // model custom methods
        staticMethods: undefined,
        // model's instance custom methods
        instanceMethods: undefined,
        // auto index only in development environment
        autoIndex: app.env == app.ENV.DEVELOPMENT,
        // deepPopulate plugin options
        deepPopulateOptions: undefined
      }, options);

      const schema = new app.mongoose.Schema(schemaDescription, {
        autoIndex: options.autoIndex,
        toObject: {
          virtuals: true
        },
        toJSON: {
          virtuals: true
        }
      });

      // define indexes
      if (_.isArray(options.index)) {
        _.each(options.index, (index) => {
          schema.index(index.fields, index.options);
        });
      }

      // define model static methods
      if (!_.isEmpty(options.staticMethods)) {
        _.extend(schema.statics, options.staticMethods);
      }

      // define model instance methods
      if (!_.isEmpty(options.instanceMethods)) {
        _.extend(schema.methods, options.instanceMethods);
      }

      // define virtual attributes
      if (!_.isEmpty(options.virtuals)) {
        _.each(options.virtuals, (opts, key) => {
          let virtual = schema.virtual(key);

          virtual.get(options.virtuals[key].get || noop);
          virtual.set(options.virtuals[key].set || noop);
        });
      }

      // register plugins
      schema.plugin(mongooseDeepPopulate, options.deepPopulateOptions);
      schema.plugin(mongoosePopulateExtended);

      return schema;
    }
  }

  /**
   * Define mongoose model
   * @param   {Application} app
   * @returns {Function}
   */
  static define (app) {
    return (modelName, schemaDescription, options) => {
      let schema = Mongoose.defineSchema(app)(schemaDescription, options);

      return app.mongoose.model(modelName, schema);
    }
  }

  /**
   * Map single or an array of mongoose model instances into plaint Object
   * @param   {Mongoose.Model|Array<Mongoose.Model>}  arr
   * @returns {Array<Object>}
   */
  static mapToObject(arr) {
    arr = _.isArray(arr) ? arr : [arr];

    return _.map(arr, (item) => {
      return item.toObject();
    });
  }
  static toObject(arr) {
    return this.mapToObject(arr);
  }

  /**
   * Map single or an array of mongoose model instances into JSON
   * @param   {Mongoose.Model|Array<Mongoose.Model> arr
   * @returns {Array<Object>}
   */
  static toJSON(arr) {
    arr = _.isArray(arr) ? arr : [arr];

    return _.map(arr, (item) => {
      return _.omit(item.toJSON(), TO_JSON_OMIT);
    });
  }
}

module.exports = Mongoose;

var decorators = require('./decorators')
  , _ = require('lodash')
  , required = new Descriptor()

Object.defineProperty(required, 'toString', { 
  enumerable: false, 
  value: function(){ return '[Required Property]'}
})

var desc = module.exports = {

  required: required,

  property: function(value){
    var desc = value
      , isDesc = _.isPlainObject(value) && _.has(value, 'value') 
                || _.has(value, 'set') || _.has(value, 'get') 
                || _.has(value, 'writable') || _.has(value, 'enumerable');

    return new Descriptor(function (){
      if( !isDesc  ) desc = { value: desc }

      return _.extend({}, desc, {
        enumerable: true, 
        writable: true, 
        configurable: true
      })
    })
  }

  Descriptor: Descriptor,

  from: function(fromObj, oldkey) {
    if( typeof fromObj === 'string')
      oldkey = fromObj, fromObj = null;
    
    if ( fromObj && oldkey) return fromObj[oldkey]

    return new Descriptor(function (key){
      return (fromObj || this)[oldkey || key]
    })
  },

  compose:       describe(decorators.compose, true),
  composeBefore: describe(decorators.composeBefore),

  before: describe(decorators.before),
  after:  describe(decorators.after, true),

  around: function(value){
    return new Descriptor(function(key, previousValues){
      return _.partial(
          value
        , _.reduce(previousValues, decorators.chain))
    })
  },

  chain:  describe(decorators.chain),

  merge:  describe(decorators.merge),

  reduce: function (method, initialValue) {
    var len = arguments.length
    return new Descriptor(function (key, previousValues) {
      return len === 1 
        ? _.reduce(previousValues, method.bind(this))
        : _.reduce(previousValues, method.bind(this), initialValue)
    })
  },

  concat: function(prop){
    var hasProp = arguments.length > 0

    return desc.reduce(function(a, b, idx, list) {
      if ( a === undefined ) a = []

      return idx === (list.length - 1 ) && hasProp
        ? [].concat(a, b, prop)
        : [].concat(a, b)

    }, undefined)
  }
}


function Descriptor(fn){ this.resolve = fn }


/**
 * turns a normal decorator into a 'descriptor'
 * @param  {function} composer
 * @return {function}
 */
function describe(composer, trailing) {

  return function (method) {
    
    return new Descriptor(function (key, previousValues) {

      if ( method !== undefined)
        previousValues[trailing ? 'push' : 'unshift' ](method)

      //console.log(previousValues)
      return _.reduce(previousValues, function(merged, next, idx){
        return trailing
          ? composer(next, merged)
          : composer(merged, next)
      })
    })
  }

}
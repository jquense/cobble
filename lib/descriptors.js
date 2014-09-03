
var decorators = require('./decorators')
  , _ = require('lodash')
  , required = new Descriptor()

Object.defineProperty(required, 'toString', { 
  enumerable: false, 
  value: function(){ return '[Required Property]'}
})

module.exports = {

  required: required,

  Descriptor: Descriptor,

  from: function(fromObj, oldkey) {
    if( typeof fromObj === 'string')
      oldkey = fromObj, fromObj = null;
    
    if ( fromObj && oldkey) return fromObj[oldkey]

    return new Descriptor(function (key){
      return (fromObj || this)[oldkey || key]
    })
  },

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
    return new Descriptor(function (key, previousValues) {
      return initialValue === undefined 
        ? _.reduce(previousValues, method.bind(this))
        : _.reduce(previousValues, method.bind(this), initialValue)
    })
  },

  concat: describe(function(a, b){
    if( !_.isArray(a) || !_.isArray(b) )
      throw new TypeError('concat descriptor must be called with arrays')

    return [].concat(b, a)
  })
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
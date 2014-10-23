
var decorators = require('./decorators')
  , reduce = require('array-reduce')
  , required = new Descriptor()

Object.defineProperty(required, 'toString', {
  enumerable: false,
  value: function(){ return '[Required Property]'}
})

required.isRequired = true;

var desc = module.exports = {

  required: required,

  Descriptor: Descriptor,

  isRequired: function isRequired(value){
    return value === required || (desc.isDescriptor(value) && value.isRequired)
  },

  isDescriptor: function isDescriptor(value){
    return value && value.isCobbleDescriptor === true
  },

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
      return partial(value, reduce(previousValues, decorators.chain))
    })
  },

  chain:  describe(decorators.chain),

  merge:  describe(decorators.merge),

  reduce: function (method, initialValue) {
    var len = arguments.length
    return new Descriptor(function (key, previousValues) {
      return len === 1
        ? reduce(previousValues, method.bind(this))
        : reduce(previousValues, method.bind(this), initialValue)
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


function Descriptor(fn){
  this.resolve = fn
  this.isCobbleDescriptor = true
}


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
      return reduce(previousValues, function(merged, next, idx){
        return trailing
          ? composer(next, merged)
          : composer(merged, next)
      })
    })
  }
}

function partial(fn, arg) {
  return function() {
    var l = arguments.length, args = new Array(l);
    for (var i = 0; i < l; i++) args[i] = arguments[i];
    args.unshift(arg)
    return fn.apply(this, args);
  };
}
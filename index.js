var _ = require('lodash')
  , apply = require('./lib/apply')
  , invariant = require('./lib/invariant')
  , descriptors = require('./lib/descriptors')

module.exports = _.extend({

  compose: function(){
    var args = _.toArray(arguments)
      , result = {};

    for(var i = 0; i < args.length; i++)
      mixInto(result, args[i])

    checkRequired(result)

    return result
  },

  extends: function(parent){
    var args = _.rest(arguments)
      , proto, child;

    proto = Object.create(parent.prototype, {
      constructor: {
        value: child, enumerable: false, writable: true, configurable: true
      }
    })

    for(var i = 0; i < args.length; i++)
      mixInto(proto, args[i])

    child = _.has(proto, 'constructor')
      : proto.constructor
      ? function (){ return apply(parent, this, arguments) };

    child.prototype = proto

    return child
  }

}, descriptors)

// function Cobble(base){
//   var mixins = _.toArray(arguments)
//     , proto  = _.last(mixins)

//     if ( typeof base)
// }


/**
 * composes two objects mutating the first
 * @param  {object} src
 * @param  {object} target
 * @return {object}
 */
function mixInto(src, target){
  var key, val, inSrc, isRequired, decorator;

  _.each(target, function(value, key){
    define(value, key, src)
  })
}

/**
 * adds a property to the src object or expands the value if it is a decorator
 * @param  {*} value
 * @param  {string} key
 * @param  {object} src
 */
function define(value, key, src){
  var inSrc = _.has(src, key)
    , isRequired = value === descriptors.required
    , isDescriptor = value instanceof descriptors.Descriptor;

  if ( !isRequired && isDescriptor ) 
    return define(value.resolve.call(src, key), key, src)

  Object.defineProperty(src, key, {
    enumerable: true, 
    writable: true, 
    configurable: true,
    value: value
  })
}

function checkRequired(obj){
  var required = _.where(result, function(v){ 
      return v === descriptors.required 
    })

  invariant( required.length === 0
    , "Unmet required properties: %s", required.join(', '))
}

//cobble(base, mixin, mixin, mixin, proto)

function inherit(parent, protoProps, staticProps) {
    var child = function (){ return apply(parent, this, arguments) };

    child = _.has(protoProps, 'constructor')
        ? protoProps.constructor
        : child
    
    _.extend(child, parent, staticProps)

    child.prototype = Object.create(parent.prototype, {
      constructor: {
        value: child, enumerable: false, writable: true, configurable: true
      }
    })

    _.extend(child.prototype, protoProps)
    
    return child
};
var _ = require('lodash')
  , invariant = require('./lib/invariant')
  , descriptors = require('./lib/descriptors')

/**
 * compose objects into a new object, leaving the original objects untouched
 * @param {...object} an object to be composed.
 * @return {object}
 */     
function compose(){
  var args = _.flatten(arguments, true)
    , result = {}
    , propHash = {};

  for(var i = 0; i < args.length; i++)
    mixInto(result, args[i], propHash)

  checkRequired(result)

  return result
}

/**
 * compose arguments into the first arg, mutating it
 * @param  {objects target
 * @param  {...objects} object to merge into the target object
 * @return {object}
 */
function composeInto(first){
  var args = _.rest(_.flatten(arguments, true))
    , propHash = {};

  for(var i = 0; i < args.length; i++)
    mixInto(first, args[i], propHash)

  checkRequired(first)

  return first
}

/**
 * composes two objects mutating the first
 * @param  {object} src
 * @param  {object} target
 * @return {object}
 */
function mixInto(src, target, propHash){
  var key, val, inSrc, isRequired, decorator;

  _.each(target, function(value, key){
    define(value, key, src, propHash)
  })
}

/**
 * adds a property to the src object or expands the value if it is a decorator
 * @param  {*} value
 * @param  {string} key
 * @param  {object} src
 */
function define(value, key, src, propHash){
  var inSrc = _.has(src, key)
    , isRequired = value === descriptors.required
    , isDescriptor = value instanceof descriptors.Descriptor
    , prev;

  if ( !isRequired ) 
    if ( isDescriptor) {
      prev = (propHash[key] || []).splice(0) //assume this descriptor is resolving all of the conflicts
      //console.log(prev, propHash[key])
      return define(value.resolve.call(src, key, prev), key, src, propHash)
    }
    else
      add(propHash, key, value)

  Object.defineProperty(src, key, {
    enumerable: true, 
    writable: true, 
    configurable: true,
    value: value
  })
}

function checkRequired(obj){
  var required = _.keys(_.pick(obj, function(v){ 
      return v === descriptors.required 
    }))

  invariant( required.length === 0
    , "Unmet required properties: %s", required.join(', '))
}

function add(obj, key, value) {
  obj[key] = (obj[key] || [])
  obj[key].push(value)
}

module.exports = _.extend({

  compose: compose,
  composeInto: composeInto,

}, descriptors)

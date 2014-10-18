'use strict';
var _ = require('lodash')
  , invariant = require('./lib/invariant')
  , descriptors = require('./lib/descriptors')

module.exports = _.extend(cobble, descriptors)

/**
 * compose objects into a new object, leaving the original objects untouched
 * @param {...object} an object to be composed.
 * @return {object}
 */
function cobble(){
  var args = [], last;

  for(var i = 0; i < arguments.length; ++i) {
    last = arguments[i];
    if( _.isArray(last) ) args = args.concat(last)
    else args[args.length] = last
  }

  return  cobble.into({}, args)
}

/**
 * compose arguments into the first arg, mutating it
 * @param  {object} target object; is mutated.
 * @param  {...objects} object to merge into the target object
 * @return {object}
 */
cobble.into = function into() {
  var args = []
    , propHash = {}
    , target, last;

  for(var i = 0; i < arguments.length; ++i) {
    last = arguments[i];
    if( _.isArray(last) ) args = args.concat(last)
    else args[args.length] = last
  }

  if(args.length === 1)
    return args[0]

  target = args.shift()

  for(var i = 0; i < args.length; i++)
    for(var key in args[i]) {
      var value = args[i][key]
        , inTarget   = key in target
        , isRequired = descriptors.isRequired(value);

      if ( !isRequired && inTarget && ( !_.has(propHash, key) || propHash[key].indexOf(target[key]) === -1 ))
        add(propHash, key, target[key])

      defineKey(value, key, target, propHash)
    }

  return target
}

cobble.assert = function (obj){
  var required = _.keys(_.pick(obj, descriptors.isRequired))

  if( required.length !== 0 ){
    var err = new TypeError("Unmet required properties: " + required.join(', '))
    err.required = required
    throw err
  }
}
/**
 * adds a property to the src object or expands the value if it is a decorator
 * @param  {*} value
 * @param  {string} key
 * @param  {object} src
 */
function defineKey(value, key, src, propHash){
  var isDescriptor = descriptors.isDescriptor(value)
    , isRequired = descriptors.isRequired(value)
    , prev;

  if (isRequired && (key in src)) return

  if ( !isRequired ) {
    if ( isDescriptor) {
      prev = (propHash[key] || []).splice(0) //assume this descriptor is resolving all of the conflicts
      //value = value.resolve.call(src, key, prev)
      return defineKey(value.resolve.call(src, key, prev), key, src, propHash)
    }
    else
      add(propHash, key, value)
  }

  src[key] = value
}


function add(obj, key, value) {
  obj[key] = _.has(obj, key) ? obj[key] : []
  obj[key].push(value)
}



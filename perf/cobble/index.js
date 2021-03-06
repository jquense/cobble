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
  return cobble.into({}, _.flatten(arguments, true))
}

/**
 * compose arguments into the first arg, mutating it
 * @param  {object} target object; is mutated.
 * @param  {...objects} object to merge into the target object
 * @return {object}
 */
cobble.into = function into(_first){
  var args = _.rest(_.flatten(arguments, true))
    , target = _first
    , propHash = {};

  for(var i = 0; i < args.length; i++)
    _.each(args[i], function(value, key) {
      var inTarget   = key in target
        , isRequired = descriptors.isRequired(value);

      if ( !isRequired && inTarget && ( !propHash[key] || !_.contains(propHash[key], target[key]) )) 
          add(propHash, key, target[key])

      define(value, key, target, propHash)
    })

  //checkRequired(target)

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
function define(value, key, src, propHash){
  var inSrc = key in src
    , isDescriptor = descriptors.isDescriptor(value)
    , isRequired = descriptors.isRequired(value)
    , prev;

  if (isRequired && inSrc) 
    return

  if ( !isRequired ) {
    if ( isDescriptor) {
      prev = (propHash[key] || []).splice(0) //assume this descriptor is resolving all of the conflicts
      return define(value.resolve.call(src, key, prev), key, src, propHash)
    }
    else
      add(propHash, key, value)
  }

  Object.defineProperty(src, key, {
    enumerable: true, 
    writable: true, 
    configurable: true,
    value: value
  })
}


function add(obj, key, value) {
  obj[key] = _.has(obj, key) ? obj[key] : []
  obj[key].push(value)
}



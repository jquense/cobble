
var decorators = require('./decorators')
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
  after:  describe(decorators.after),
  around: describe(decorators.around),

  merge:  describe(decorators.merge),
  chain:  describe(decorators.chain),

  concat: describe(function(a, b){
    if( !_.isArray(a) || !_.isArray(b) )
      throw new TypeError('concat descriptor must be called with arrays')

    return [].concat(a, b)
  })
}


function Descriptor(fn){ this.resolve = fn }


/**
 * turns a normal curry-able decorator into a 'descriptor'
 * @param  {function} composer
 * @return {function}
 */
function describe(composer) {
  return function (method) {
    return new Descriptor(function (key){
      return composer(method, this[key])
    })
  }

}
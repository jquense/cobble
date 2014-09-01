var _ = require('lodash')
  , apply = require('./apply')

// unecessary args premature optimization, just for fun!
// https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
var compose = module.exports = {

  chain: function chain(one, two) {
      return function chainedFunction(){
          var $_len = arguments.length
            , args = new Array($_len); 

          for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}

          var r1 = one && apply(one, this, args)
            , r2 = two && apply(two, this, args);

          if( r1 == null && r2 == null) return
          if( r1 == null ) return r2
          if( r2 == null ) return r1
          else             return _.extend({}, r1, r2)
      }
  },

  merge: function merge(a, b){
    var rslt;

    if ( typeof a !== typeof b) throw new TypeError
    else if ( _.isArray(a) )    rslt = [].concat(a, b)    
    else if ( _.isFunction(a) ) rslt = chain(a, b)  
    else                        rslt = _.extend({}, a, b)
    return rslt
  },

  before: _.curry(function(decorate, method){
    return function before(){
      var $_len = arguments.length, args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
      apply(decorate, this, args)
      return apply(method, this, args)
    }
  }),

  after: _.curry(function(decorate, method){
    return function after(){
      var $_len = arguments.length, args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
      var r = apply(method, this, args)
      apply(decorate, this, args)
      return r
    }
  }),

  around: _.curry(function(decorate, method){
    return function around(){
      var $_len = arguments.length, args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
      args = [method].concat(args)
      
      return apply(decorate, this, args)
    }
  }),

  provided: function(guard){
    return compose.around(function(fn){
      var $_len = arguments.length, args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
      args = _.rest(args)

      if(apply(guard, this, args))
        return apply(fn, this, args)
    })
  }

}


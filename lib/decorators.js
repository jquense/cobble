var _ = require('lodash')
  , apply = require('./apply')

// unecessary args premature optimization, just for fun!
// https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
var compose = module.exports = {

  merge: function chain(one, two) {
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

  chain: function merge(one, two){
     return function chainedFunction(){
        var len = arguments.length
          , args = new Array(len); 

        for(var i = 0; i < len; ++i) 
          args[i] = arguments[i];

        apply(one, this, args)
        apply(two, this, args);
      }
  },

  /**
   * compose one function before another passing in the same arguments to each, returning the last return value
   * @param  {function} decorate
   * @param  {function} method
   * @return {function}
   */
  before: _.curry(function(decorate, method){
    return function befored(){
      var $_len = arguments.length, args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
      apply(decorate, this, args)
      return apply(method, this, args)
    }
  }),

  /**
   * compose one function after another passing in the same arguments to each, returning the last return value
   * @param  {function} decorate
   * @param  {function} method
   * @return {function}
   */
  after: _.curry(function(decorate, method){
    return function aftered(){
      var $_len = arguments.length, args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
      var r = apply(method, this, args)
      apply(decorate, this, args)
      return r
    }
  }),

  /**
   * like `before` but does true composition passing the return values of `decorate` to `method`
   * @param  {function} decorate
   * @param  {function} method
   * @return {function}
   */
  composeBefore: _.curry(function(decorate, method){
    return function befored(){
      var $_len = arguments.length, args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
     
      return method.call(this, apply(decorate, this, args))
    }
  }),

  /**
   * composes two functions, where each function consumes the return value of the one before it. 
   * ex f() g() equals f(g())
   * @param  {function} decorate
   * @param  {function} method
   * @return {function}
   */
  compose: _.curry(function(decorate, method){
    return function aftered(){
      var $_len = arguments.length, args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
     
      return decorate.call(this, apply(method, this, args))
    }
  }),

  /**
   * returns a wrapped function, passing the `method` function as the first argment to `decorate`
   * @param  {function} decorate
   * @param  {function} method
   * @return {function}
   */
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


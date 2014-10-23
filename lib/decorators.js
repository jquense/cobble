var extend = require('xtend')
  , apply = require('./apply')

// unecessary args premature optimization, just for fun!
// https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
var compose = module.exports = {

  merge: function chain(one, two) {
    return function chainedFunction(){
      var l = arguments.length
        , args = new Array(l);

      for(var i = 0; i < l; ++i) args[i] = arguments[i];

      var r1 = one && apply(one, this, args)
        , r2 = two && apply(two, this, args);

      if( r1 == null && r2 == null) return
      if( r1 == null ) return r2
      if( r2 == null ) return r1
      else             return extend({}, r1, r2)
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
  before: function(decorate, method){
    return function befored(){
      var l = arguments.length
        , args = new Array(l);

      for(var i = 0; i < l; ++i) args[i] = arguments[i];

      apply(decorate, this, args)
      return apply(method, this, args)
    }
  },

  /**
   * compose one function after another passing in the same arguments to each, returning the last return value
   * @param  {function} decorate
   * @param  {function} method
   * @return {function}
   */
  after: function(decorate, method){
    return function aftered(){
      var l = arguments.length
        , args = new Array(l)
        , r;

      for(var i = 0; i < l; ++i) args[i] = arguments[i];

      r = apply(method, this, args)
      apply(decorate, this, args)
      return r
    }
  },

  /**
   * like `before` but does true composition passing the return values of `decorate` to `method`
   * @param  {function} decorate
   * @param  {function} method
   * @return {function}
   */
  composeBefore: function(decorate, method){
    return function befored(){
      var l = arguments.length
        , args = new Array(l);

      for(var i = 0; i < l; ++i) args[i] = arguments[i];

      return method.call(this, apply(decorate, this, args))
    }
  },

  /**
   * composes two functions, where each function consumes the return value of the one before it.
   * ex f() g() equals f(g())
   * @param  {function} decorate
   * @param  {function} method
   * @return {function}
   */
  compose: function(decorate, method){
    return function aftered(){
      var l = arguments.length
        , args = new Array(l);

      for(var i = 0; i < l; ++i) args[i] = arguments[i];

      return decorate.call(this, apply(method, this, args))
    }
  },

  /**
   * returns a wrapped function, passing the `method` function as the first argment to `decorate`
   * @param  {function} decorate
   * @param  {function} method
   * @return {function}
   */
  around: function(decorate, method){
    return function around(){
      var l = arguments.length
        , args = new Array(l);

      for(var i = 0; i < l; ++i) args[i] = arguments[i];

      args.unshift(method)
      return apply(decorate, this, args)
    }
  }

}


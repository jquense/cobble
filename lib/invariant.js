var _ = require('lodash')
  , DEBUG = (this.__DEV__);

if (DEBUG === undefined)
  DEBUG = ((process && process.env && process.env.NODE_DEBUG) !== 'production')

module.exports = !DEBUG
  ? _.noop
  : function invariantWarning(condition, format){
    if (condition) return

    if (format === undefined)
      throw new Error("must provide a format string!");

    var args = [].slice.call(arguments, 2)
      , idx  = 0;

    console.warn && 
    console.warn('Warning: ' + format.replace(/%s/g, function(){
        return args[idx++];
      }));

  }
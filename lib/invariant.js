var _ = require('lodash');

module.exports = process.env.NODE_ENV === 'production'
  ? _.noop
  : function invariantWarning(condition, format){
    if (condition) return

    if (format === undefined)
      throw new Error("must provide a format string!");

    var args = _.rest(arguments, 1)
      , idx  = 0;

    console.warn('Warning: ' + format.replace(/%s/g, function(){
        return args[idx++];
      }));

  }
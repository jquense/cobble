
module.exports = function apply(fn, ctx, args) {
    switch (args.length) {
      case 1:  return fn.call(ctx, args[0])
      case 2:  return fn.call(ctx, args[0], args[1])
      case 3:  return fn.call(ctx, args[0], args[1], args[2])
      case 0:  return fn.call(ctx)

      default: return fn.apply(ctx, args)
    }
}
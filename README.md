Cobble
========

Tiny composition lib for doing easy object mixins. The point of Cobble is to add minimal sugar to doing normal Object and Function composition. It is something like Traits, except that conflicts are overridden by default. Cobble works out to being fairly useful as the underpinnings for mixin systems for other object models, as it provides a robust and straightforward way to handle multiple conflicts when merging objects together.

If you are looking for a more complete object model wrapper try: [Clank](https://github.com/theporchrat/clank) which uses cobble internally.

## Changes in v2.0.0

- remove `provided()` descriptor

## Changes in v1.1.2

- performance improvements

## Changes in v1.1.0

- the `cobble` and `cobble.into` functions no longer warn about missing properties. use the newly added `cobble.assert`, or `cobble.isRequired` methods to do finalizing checks
- Internal calls to `instanceof Descriptor` have been replaces with a duck typing check (see `isDescriptor`) in order to allow interop between different included cobble packages.

## API

Require the module; 

  var cobble = require('cobble')

### cobble(...objects)
Compose a bunch of object literals into a single new object. `cobble()` does not mutate any of the arguments. 

    var first = { isCool: true }
      , second = { isAwesome: true }
      , result = cobble(first, second);

    result.isCool && result.isAwesome // => true

**note:** you can pass in arrays of objects as well and cobble will flatten them appropriately: `cobble([ first, second], third, [fourth, fifth])` saves needing to use `apply()` in most cases

### cobble.into(target, ...objects)
Compose a bunch of object literals into a single new object. `.into()` mutates the first argument, useful for composing into an existing object, or a prototype.

    var first = { isCool: true }
      , second = { isAwesome: true };

    cobble.into(first, second)
    first.hasOwnProperty('isAwesome') //=> true

**note:** you can pass in arrays of objects as well and cobble will flatten them appropriately: `cobble.into([ first, second], third, [fourth, fifth])` saves needing to use `apply()` in most cases

### cobble.assert(object)

Checks the passed in `object` for the existence of unmet required properties on the object. You can use this a check when an object is finalized. On failure it throws a `TypeError` with the property `required` which is an array of the missing properties.

### Descriptors
Descriptors are function helpers for telling cobble how to handle conflicts between properties. By default, conflicting properties will be overridden by a later property in the chain
    
    var mixinA = { greet: function(){ console.log('first one!') } }
      , mixinB = { greet: function(){ console.log('second one!') } }
      , result = cobble(mixinA, mixinB);

    result.greet() //=> 'second one!'

we can adjust the behaviour by using a descriptor to hint at how cobble should compose the property. here we use the `before` descriptor to decorate the property.

    var mixinA  = { greet: function(){ console.log('first one!') } }
      , result = cobble(
          mixinA, 
          {
            greet: cobble.before(function(){ 
                console.log('second one!') 
            })
          });

    result.greet() //=> 'second one!' 
                   //   'first one!'

Cobble will resolve conflicts in order, and keep track of conflict values so they can be resolved at once. This means that when composing a bunch of objects with conflicts you can provide one resolution strategy for all conflicting values in a chain, instead of each one individually

consider the following composition:

    var mixinA = { greet: function(){ console.log('hi') } }
      , mixinB = { greet: function(){ console.log('hola') } }
      , mixinC = { greet: function(){ console.log('greetings!') } };

    cobble(mixinA, mixinB, mixinC)

each mixin specifies a `greet` method that would conflict with the others if we compose them. Since cobble internally tracks each conflict we can use a single descriptor to compose each `greet` method

    var chained = cobble(
        mixinA, 
        mixinB, 
        mixinC, 
        {
            greet: cobble.chain()
        })

    chained.greet() // =>  'hi', 'hola', 'greetings'

Descriptors are passed in all previous values of a particular property at the time it is composed in the chain (in this case mixinA, B and C). Once a descriptor 'resolves' a set of values, they are considered resolved and any descriptors for the same key further down the chain will be passed in the composed value, and not the original values. for example if we changed the example to: 

    var chained = cobble(
        mixinA, 
        mixinB, 
        {
            greet: cobble.chain()
        },
        mixinC,
        {
            greet: cobble.before(function(){
                console.log("e'llo")    
            })
        })

is the same as:

    var chained = cobble(
        mixinA, 
        mixinB, 
        {
            greet: cobble.chain()
        })

    var befored = cobble(
        chained,    
        mixinC,
        {
            greet: cobble.before(function(){
                console.log("e'llo")    
            })
        });

Most descriptors can be called without any arguments and will be applied to any existing conflicts up the chain.

__NOTE: `cobble` checks down the entire prototype chain not just "own" properties, this allows you to do super calls easily when composing objects with "inherited" properties, but can lead to unintended behaviour if you are not aware__



#### Included Descriptors:

`cobble.required` - A special Descriptor that identifies a property as required. By default required properties do not warn, so you can use `cobble.assert(obj)` to check for the existence unmet requirements.

    var result = cobble({ greeting: cobble.required });

    cobble.assert(result) // TypeError: Unmet requirements: 'greetings'

    result = cobble(result, { greeting: 'hello'})

    cobble.assert(result) // no error



`cobble.compose(method)` - composes the provided method into the chain of values, where each function consumes the return value of the previous

    var result = cobble(
        { 
          greeting: function(){ return 'hello' }
        },
        { greeting: cobble.compose(function(greeting){ 
            return greeting + ' and good day'
          })
      });

      result.greeting() //=> 'hello and good day' 

`cobble.composeBefore(method)` - exactly like `.compose` except the provided function is as the first function in the composition chain.

`cobble.before(method)` - wraps the provided method before the previous method(s) of the same property. The arguments passed to each method in the chain are the same, meaning it _ignores_ return values

`cobble.after(method)` - wraps the provided method before the previous method(s) of the same property. The arguments passed to each method in the chain are the same, meaning it _ignores_ return values

    var mixinA  = { greet: function(){ console.log('hi') } }
      , result = cobble.compose(
          mixinA, 
          {
            greet: cobble.after(function(){ 
                console.log('john') 
            })
          });

      result.greet() //=> 'hi' 'john' 

`cobble.around(method)` - wraps the provided method around the previous method of the same property, passing in the previous method as the first argument 
    
    {
        key: cobble.around(function(prevMethod, argA, argB){
            console.log('do something before')
            prevMethod.call(this, argA, argB)
            console.log('do something after')
        })
    }     

`cobble.concat(array)` - concats an array property with the previous one
 
`cobble.from([object, [oldKey]])` - shallow borrow a property from another object, or key. If you provide BOTH an `object` and a `key` then the property `key` of `obj` is returned instead of a Descriptor.

    var obj = { a: true, c: false, d: 'hi' }
      , result;

    result = cobble(obj, {  b: cobble.from(obj, 'a') }) //this is equivalent to doing `{ b: obj.a }`

    result.b // => true

    result = cobble(obj, {  b: cobble.from('c') }) //b is set to c during composition

    result.b // => false

    result = cobble(obj, {  d: cobble.from(obj) })

    result.d // => 'hi'

`cobble.chain()` - composes all functions in the chain into a single function that is called in order. Return values are ignored. This is an alias for `before`.

`cobble.merge()` - composes all functions in the chain into a single function that is called in order. Merge makes an attempt to merge the return values of each function into a single return value, merge assumes that return values will be objects and uses `Object.assign` to create a new unified return value.

`cobble.Descriptor(fn)` - Base Descriptor object, which you can create custom descriptors with. Descriptors are created by providing a function that is called at the time of composition, The value returned from the function will be the value set to the provided `key`. The `previousValues` parameter is an array of any and all possible values for that key up to the point when the descriptor is called.

    var reduce = new cobble.Descriptor(function(key, previousValues){
        return previousValues.reduce(function(result, next){
            return result + next
          }, 0)
      })

    var obj = cobble(
      { num: 1 },
      { num: 2 },
      { num: reduce } // at this point previous values will be [1, 2]
      { num: 4 }
      { num: reduce }) // now previous values will be [3, 4]

    obj.num // => 7


`cobble.isDescriptor(value)` - duck type check for descriptors, use this instead of `value instanceof cobble.Descriptor`, which will fail for descriptors passed in from other cobble instances.

`cobble.isRequired(value)` - returns `true` if the value is a required property descriptor, use this instead of a `val instanceof cobble.required`, which will fail for descriptors passed in from other cobble instances.
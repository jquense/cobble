Cobble
========

tiny composition lib for doing easy object mixins. 

## API

### compose([...objects])
compose a bunch of object literals into a single new object. `compose()` does not mutate any of the arguments

    var mixinA = { a: true }
      , mixinB = { b: true }
      , result = cobble.compose(mixinA, mixinB);


### composeInto([target, ...objects])
compose a bunch of object literals into a single new object. `composeInto()` mutates the first argument, useful for compising into an existing object, or a prototype.

    var mixinA = { a: true }
      , mixinB = { b: true };

    cobble.composeInto(mixinA, mixinB)
    console.log(mixinA.b) //=> true

### Descriptors
Descriptors are function helpers for telling cobble how to handle conflicts between properties. By default, conflicting properties will be overridden by a later property in the chain
    
    var mixinA = { greet: function(){ console.log('first one!') } }
      , mixinB = { greet: function(){ console.log('second one!') } }
      , result = cobble.compose(mixinA, mixinB);
    result.greet() //=> 'second one!'

we can adjust the behaviour by using a descriptor to hint at how cobble should compose the property. here we use the `before` descriptor to decorate the property.

    var mixinA  = { greet: function(){ console.log('first one!') } }
      , result = cobble.compose(
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

    cobble.compose(mixinA, mixinB, mixinC)

each mixin specifies a `greet` method that would conflict with the others if we compose them. Since cobble internally tracks each conflict we can use a single descriptor to compose each `greet` method

    var chained = cobble.compose(
        mixinA, 
        mixinB, 
        mixinC, 
        {
            greet: cobble.chain()
        })

    chained.greet() // =>  'hi', 'hola', 'greetings'

Descriptors are passed in all previous values of a particular property at the time it is composed in the chain (in this case mixinA, B and C). Once a descriptor 'resolves' a set of values, they are considered resolved and any descriptors for the same key further down the chain will be passed in the composed value, and not the original values. for example if we changed the example to: 

    var chained = cobble.compose(
        mixinA, 
        mixinB, 
        {
            greet: cobble.chain()
        },
        mixinC,
        {
            greet: cobble.before(function(){
                console.log('e\'llo')    
            })
        })

is the same as:

    var chained = cobble.compose(
        mixinA, 
        mixinB, 
        {
            greet: cobble.chain()
        })

    var befored = cobble.compose(
        chained,    
        mixinC,
        {
            greet: cobble.before(function(){
                console.log('e\'llo')    
            })
        });


#### Cobble comes with a few descriptors already:

`before(method)` - wraps the provided method before the previous method(s) of the same property  

`after(method)` - wraps the provided method before the previous method(s) of the same property

    var mixinA  = { greet: function(){ console.log('hi') } }
      , result = cobble.compose(
          mixinA, 
          {
            greet: cobble.after(function(){ 
                console.log('john') 
            })
          });

      result.greet() //=> 'hi' 'john' 

`around(method)` - wraps the provided method around the previous method of the same property, passing in the previous method as the first argument 
    
    {
        key: cobble.around(function(prevMethod, argA, argB){
            console.log('do something before')
            prevMethod.call(this, argA, argB)
            console.log('do something after')
        })
    }     

`concat(array)` - concats an array property with the previous one
 
`from([object, [oldKey]])`: shallow borrow a property from another object, or key.
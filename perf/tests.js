var Benchmark = require('benchmark')
  , _ = require('lodash')
  , cobble = require('../index')
  , oldCobble = require('./cobble/index')
  , suites = [];

global.cobble = cobble
global.oldCobble = oldCobble

var current = 'current: ' + require('../package.json').version
  , last =  'last: ' + require('./cobble/package.json').version

_.extend(Benchmark.Suite.options, {
  onStart: function(){ 
    console.log('\n' + this.name + ':') 
  },
  onCycle: function(event) {
    //console.log(event.target);
  },
  onComplete: require('./setup').onSuiteComplete(suites, current, last)

})

_.extend(Benchmark.options, {
  setup: function(){
    var cobble = global.cobble
      , oldCobble = global.oldCobble;

    var current = {
      flat: getFlatMixins(cobble)
    }

    var old = {
      flat: getFlatMixins(oldCobble)
    }

    function getFlatMixins(cobble){
      return [{
          a: function(){
            return 'hello'
          },
          b: 50,
          c: [1,2,3,4],
          d: [{ a: 'bergf' },{ a: 'bergf' },{ a: 'bergf' }],
          e: function(){ this.b += 50 } 
        },
        {
          a: cobble.compose(function(last){
            return last + ' steve'
          }),
          h: 50,
          c: cobble.concat([1,2,3,4]),
          i: function(){ this.b += 50 } 
        },
        {
          a: cobble.compose(function(last){
            return last + ' smith'
          }),
          e: cobble.before(function(){
            this.b += 25
          }) 
        }
      ]
    }

  }
})



suites.push(
  Benchmark.Suite('create simple object')
    .add(current, function(){
      cobble({ hello: 'hi'}, { num: 12344})
    })
    .add(last, function(){
      oldCobble({ hello: 'hi'}, { num: 12344})
    })
)

suites.push(
  Benchmark.Suite('compose a simple object into')
    .add(current, function(){
      cobble.into({ hello: 'hi'}, { num: 12344})
    })
    .add(last, function(){
      oldCobble.into({ hello: 'hi'}, { num: 12344})
    })
)

suites.push(
  Benchmark.Suite('compose a complex object')
    .add(current, {
      fn: function(){
        cobble(current.flat[0], current.flat[1], current.flat[2])
      }
    })
    .add(last, {

      fn: function(){
        oldCobble(old.flat[0], old.flat[1], old.flat[2])
      }
    })
)

suites.push(
  Benchmark.Suite('compose a complex object into')
    .add(current, {
      fn: function(){
        cobble.into(current.flat[0], current.flat[1], current.flat[2])
      }
    })
    .add(last, {

      fn: function(){
        oldCobble.into(old.flat[0], old.flat[1], old.flat[2])
      }
    })
)

suites[0].run({ async: true })



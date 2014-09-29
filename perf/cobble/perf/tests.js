var Benchmark = require('benchmark')
  , Backbone = require('backbone')
  , _ = require('lodash')
  , cobble = require('../index')
  , suites = [];

console.log(Benchmark.formatNumber)
_.extend(Benchmark.Suite.options, {
  onStart: function(){ 
    console.log('\n' + this.name + ':') 
  },
  onCycle: function(event) {
    //console.log(event.target);
  },
  onComplete: require('./setup').onSuiteComplete(suites)

})

function BackboneObject(){
  this.id = 'hello'
}
BackboneObject.extend = Backbone.Model.extend;

suites.push(
  Benchmark.Suite('simple object inheritance')
    .add('backbone object', function(){
      BackboneObject.extend({
        a: function(){ return 'hello' },
        b: 5,
        c: function(){ return 5 },
        d: function(){ this.b = 'h'},
        e: 'hello'
      })
    })
    .add('clank object', function(){
      Clank.Object.extend({
        a: function(){ return 'hello' },
        b: 5,
        c: function(){ return 5 },
        d: function(){ this.b = 'h'},
        e: 'hello'
      })
    })
)

suites.push(
  Benchmark.Suite('simple object inheritance')
    .add('backbone object', {
      fn: function(){
        BackboneObject.extend({
          a: function(){ return 'hello' },
          b: 5,
          c: function(){ return 5 },
          d: function(){ this.b = 'h'},
          e: 'hello'
        })
      }
    })
    .add('clank object', function(){
      Clank.Object.extend({
        a: function(){ return 'hello' },
        b: 5,
        c: function(){ return 5 },
        d: function(){ this.b = 'h'},
        e: 'hello'
      })
    })
)

suites[0].run({ async: true })




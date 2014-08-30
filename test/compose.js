var chai  = require('chai')
  , sinon = require("sinon")
  , sinonChai = require("sinon-chai")
  , cobble = require('../index');

chai.use(sinonChai);
chai.should();


describe(' when composing objects together', function(){

  it( 'should have all properties', function(){
    var method = function(){}
      , result;

    result = cobble.compose({ a: false, b: 5 }, { a: true })

    Object.keys(result).length.should.equal(2)
  })

  it( 'should not mutate any inputs', function(){
    var method = function(){}
      , one = { a: false }
      , two = { a: true }
      , result;

    result = cobble.compose(one, two)

    one.should.deep.equal({ a: false })
    two.should.deep.equal({ a: true })
    result.should.not.equal(two)
  })

  it( 'should override earlier properties my default', function(){
    var method = function(){}
      , result;

    result = cobble.compose({ a: false, }, { a: true })
    result.a.should.equal(true)
  })

  describe( 'when using descriptors', function(){

    it( 'should construct descriptors', function(){

      var rslt = new cobble.Descriptor(function(){
        return true
      })

      rslt.should.be.an('object')
        .and.to.have.property('resolve')
        .that.is.a('function')

    })

    it( 'should execute the descriptor', function(){
      var method = function(){}
        , result;

      result = cobble.compose({
          a: function(){ throw new Error }
        }, 
        {
          a: new cobble.Descriptor(function(key){
            return true
          })
        })

      result.a.should.equal(true)
    })
  })
})
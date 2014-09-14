var chai  = require('chai')
  , sinon = require("sinon")
  , sinonChai = require("sinon-chai")
  , cobble = require('../index');

chai.use(sinonChai);
chai.should();


describe(' when composing objects together', function(){

  it( 'should handle arrays', function(){
    var result;

    result = cobble({ a: false, b: 5 }, [{ a: true }, { a: 'hi' }])

    result.a.should.equal('hi')
    Object.keys(result).length.should.equal(2)

    
    result = cobble([{ a: false, b: 5 }, { a: [1] }])

    result.a[0].should.equal(1)
    Object.keys(result).length.should.equal(2)
  })


  it( 'should have all properties', function(){
    var result;

    result = cobble({ a: false, b: 5 }, { a: true })

    Object.keys(result).length.should.equal(2)
  })

  it( 'should not mutate any inputs', function(){
    var one = { a: false }
      , two = { a: true }
      , result;

    result = cobble(one, two)

    one.should.deep.equal({ a: false })
    two.should.deep.equal({ a: true })
    result.should.not.equal(two)
  })

  it( 'should override earlier properties my default', function(){
    var result;

    result = cobble({ a: false, }, { a: true })
    result.a.should.equal(true)
  })

  it( 'should work on inherited object props', function(){
    var spy, result;

    result = cobble({ constructor: spy = sinon.spy(function(){}) })

    result.constructor()
    spy.should.have.been.calledOnce
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
      var result;

      result = cobble({
          a: function(){ throw new Error }
        }, 
        {
          a: new cobble.Descriptor(function(key){
            return true
          })
        })

      result.a.should.equal(true)
    })

    it( 'should warn about missing required properties', function(){
      var result, st;

      if ( console.warn.restore ) console.warn.restore()

      st = sinon.stub(console, 'warn', function(){})

      result = cobble(
        { a: cobble.required }, 
        { b: true })

      result.a.should.equal(cobble.required)
      st.should.have.been.calledOnce

      console.warn.restore()
    })

    it( 'should override required', function(){
      var result;

      result = cobble(
        { a: cobble.required }, 
        { a: true })

      result.a.should.equal(true)
    })

    it( 'should not override a value with "required"', function(){
      var result;

      result = cobble(
        { a: true },
        { a: cobble.required })

      result.a.should.equal(true)
    })
  })
})
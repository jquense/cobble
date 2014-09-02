var chai  = require('chai')
  , sinon = require("sinon")
  , sinonChai = require("sinon-chai")
  , cobble = require('../index');

chai.use(sinonChai);
chai.should();


describe(' when using descriptors', function(){

  it( 'should only resolve a prop once', function(){
    var result
      , spyA = sinon.spy()
      , spyB = sinon.spy()
      , spyC = sinon.spy()
      , spyD = sinon.spy();

    result = cobble.compose(
        { prop: spyA }
      , { prop: spyB }
      , { prop: cobble.before(spyC) }
      , { prop: cobble.after(spyD) })

      result.prop()

      spyA.should.have.been.calledOnce
      spyB.should.have.been.calledOnce
      spyC.should.have.been.calledBefore(spyA).and.calledOnce
      spyD.should.have.been.calledAfter(spyC).and.calledOnce
  })

  it( 'should work without a specified method', function(){
    var result
      , spyA = sinon.spy()
      , spyB = sinon.spy()
      , spyC = sinon.spy()
      , spyD = sinon.spy();

    result = cobble.compose(
        { prop: spyA }
      , { prop: spyB }
      , { prop: spyC }
      , { prop: cobble.chain() })

      result.prop()

      spyA.should.have.been.calledOnce
      spyB.should.have.been.calledAfter(spyA).and.calledOnce
      spyC.should.have.been.calledAfter(spyB).and.calledOnce
  })

  it( 'should call the new method before the old', function(){
    var result, i
      , spyA = sinon.spy(), spyB = sinon.spy(), spyC = sinon.spy();

    result = cobble.compose(
        { a: spyA }
      , { a: spyB }
      , { a: cobble.before(spyC) })

      result.a()

      spyC.should.have.been.calledBefore(spyA).and.calledOnce
      spyA.should.have.been.calledBefore(spyB).and.calledOnce
      spyB.should.have.been.calledOnce
  })

  it( 'should call the new method after the old', function(){
    var result, i
      , spyA = sinon.spy(), spyB = sinon.spy(), spyC = sinon.spy();

    result = cobble.compose(
        { a: spyA }
      , { a: spyB }
      , { a: cobble.after(spyC) })

      result.a()
      spyC.should.have.been.calledAfter(spyB).and.calledOnce
      spyB.should.have.been.calledAfter(spyA).and.calledOnce
      spyA.should.have.been.calledOnce
  })
  
  it( 'should call the new method around the old', function(){
    var result, spyA = sinon.spy(), spyB = sinon.spy(), spyC;

    result = cobble.compose(
        { a: spyA }
      , { a: spyB }
      , { a: cobble.around(spyC = sinon.spy(function(wrapped){
            spyA.should.have.not.been.called
            spyB.should.have.not.been.called
            wrapped.call(this)
          })) 
        })

      result.a()
      spyC.should.have.been.calledBefore(spyA).and.have.been.calledOnce
      spyB.should.have.been.calledAfter(spyA).and.calledOnce
      spyA.should.have.been.calledOnce
  })

  it( 'should reduce values', function(){
    var spanish = { greet: function(){ return "hola" } }
      , german  = { greet: function(){ return "guten morgen" } }

      , result = cobble.compose(spanish, german, {

          greet: cobble.reduce(function(target, next) {
            return function(){
              return target() + " " + next()
            }
          }, englishHello)

        });

    result.greet().should.equal("hello hola guten morgen")

    function englishHello(){ return "hello" }
  })

  it( 'should concat array', function(){
    var mixinA = { a: [1,2,3] }
      , result = cobble.compose(
          mixinA,
          {
            a: cobble.concat([4,5])
          });

    result.a.length.should.equal(5)
    result.a[4].should.equal(5)
  })

  it( 'should take from a different key', function(){
    var obj = { a: true, c: false, d: 'hi' }
      , result;

    result = cobble.compose(
        obj
      , {  b: cobble.from(obj, 'a') })

    result.b.should.equal(true)

    result = cobble.compose(
        obj
      , {  b: cobble.from('c') })

    result.b.should.equal(false)

    result = cobble.compose(
        obj
      , {  d: cobble.from(obj) })

    result.d.should.equal('hi')
  })

})
var chai  = require('chai')
  , sinon = require("sinon")
  , sinonChai = require("sinon-chai")
  , cobble = require('../index');

chai.use(sinonChai);
chai.should();


describe(' when using descriptors', function(){

  it( 'should call the new method before the old', function(){
    var method = function(){}
      , result, i = 1;

    result = cobble.compose(
        { a: function mult(){ i = 4 } }
      , { a: cobble.before(function(){ 
        i.should.equal(1)
        i = 2 
      }) 
    }).a()

    i.should.equal(4)

  })

  it( 'should call the new method after the old', function(){
    var method = function(){}
      , result, i;

    result = cobble.compose(
        { a: function(){ i = 1 } }
      , { a: cobble.after(function(){ 
        i.should.equal(1)
        i = 0 
      }) 
    }).a()

    i.should.equal(0)
  })
  
  it( 'should call the new method around the old', function(){
    var method = function(){}
      , result, i = 0;

    result = cobble.compose(
        { a: function(){ i = 1 } }
      , { a: cobble.around(function(old){ 

        i.should.equal(0)
        old.should.be.a('function')
        old.call(this)
        i.should.equal(1)
        i = 4
      }) 
    }).a()

    i.should.equal(4)
  })

  it( 'should take from a different key', function(){
    var method = function(){}
      , obj = { a: true, c: false, d: 'hi' }
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
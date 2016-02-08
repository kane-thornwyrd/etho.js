inside = (what, from)=>
  if typeof window isnt 'undefined'
    window[what] = from
  else
    global[what] = from
we = (obj)-> obj
load = (thing)=> inside thing, we require thing

getARandomString = -> Math.random().toString(36).replace(/[^a-zA-Z]+/g, '')

inside 'sinonChai', we require 'sinon-chai'

inside 'etho', we require '../index'

load 'sinon'

load('chai').should()

chai.use sinonChai


describe 'ucfirst', ->

  _testStr = getARandomString()
  _oldChrCode = 0
  _newChrCode = 0

  it 'should return the string with the first letter uppercased', ->
    _oldChrCode = _testStr.charCodeAt(0)
    _newChrCode = etho.ucfirst(_testStr).charCodeAt(0)
    _newChrCode.should.be.equal _oldChrCode - 32

  it 'should not change the case of the rest of the string', ->
    _testStr.substr(1).should.be.equal etho.ucfirst(_testStr).substr(1)

describe 'getType', ->

  it 'should give you the real native type of anything !', ->
    spy = sinon.spy()
    etho.getType([]).should.be.equal 'array'
    etho.getType({}).should.be.equal 'object'
    etho.getType(spy).should.be.equal 'function'
    etho.getType('a').should.be.equal 'string'
    etho.getType(1).should.be.equal 'number'
    etho.getType(null).should.be.equal 'null'
    etho.getType(undefined).should.be.equal 'undefined'
    spy.should.not.have.been.called

describe 'toArraySliced', ->

  arrayToTest = [
    1
    2
    3
  ]

  it 'should transform arguments to an array', ->
    stub = ->
      etho.toArraySliced arguments

    stub.apply(this, arrayToTest).should.be.deep.equal arrayToTest

  it 'should be able to slice the arguments from the start', ->
    stub = ->
      etho.toArraySliced arguments, 1

    stub.apply(this, arrayToTest).should.be.deep.equal arrayToTest.slice(1)

  it 'should be able to slice the arguments from both sides', ->
    stub = ->
      etho.toArraySliced arguments, 1, 2

    stub.apply(this, arrayToTest).should.be.deep.equal arrayToTest.slice(1, 2)

  it 'should always return an array', ->
    etho.toArraySliced({"oko":23,foo:"bar",baz:null}).should.be.an 'array'


describe 'isA',->

  it 'should be able to say if something is an Array',->
    etho.isA('array',[]).should.be.true

  it 'should be able to say if something is an Object',->
    etho.isA('object',{}).should.be.true

  it 'should be able to say if something is a String',->
    etho.isA('string','').should.be.true

  it 'should be able to say if something is a Number',->
    etho.isA('number',42).should.be.true

  it 'should be able to say if something is a Boolean',->
    etho.isA('boolean',true).should.be.true

  it 'should be able to say if something is a Function',->
    spy = sinon.spy()
    etho.isA('function',spy).should.be.true
    spy.should.not.have.been.called

  it 'should be able to say if something is Undefined',->
    etho.isA('undefined',undefined).should.be.true

  it 'should be able to say if something is null',->
    etho.isA('null',null).should.be.true

describe 'shallowCopy', ->

  obj1 =
    foo : true
    bar : getARandomString()
    arr :
      pirate : false
      color  : getARandomString()
      limb   : [
        getARandomString()
        getARandomString()
      ]
    number : 1

  it 'shoud return a copy of an object', ->
    etho.shallowCopy(obj1).should.be.deep.equal obj1

  it 'should return a copy without any reference to the source object', ->
    copy = etho.shallowCopy(obj1)
    copy.foo = false
    copy.bar = getARandomString()
    copy.arr.limb.push 'okok'
    obj1.foo.should.not.be.deep.equal copy

describe 'forEach',->
  _testArr = [1,2,3,4,5,6,7,8,9]
  _result = 0
  _expectedResult = 45

  it 'should give the ability to execute a function on each element of an Object',->
    etho.forEach _testArr, (val, index, list)->
      _result += val
    _result.should.be.equal _expectedResult


describe 'merge',->

  obj1 =
    foo : true
    bar : getARandomString()
    arr :
      pirate : false
      color  : getARandomString()
      limb   : [
        getARandomString()
        getARandomString()
      ]
    number : 1

  refObj1 = etho.shallowCopy obj1

  obj2 =
    foo : false
    baz : [
      42
      getARandomString()
      false
    ]
    arr :
      pirate : true
      color  : 34
      limb   : [
        getARandomString()
      ]
    number: '1'

  it 'should be tested using minimum 2 different Objects',->
    obj1.should.not.be.deep.equal obj2

  it 'should not alter the Object passed as argument',->
    etho.merge(obj1, obj2)
    obj1.should.be.deep.equal refObj1

  it 'should not add attributes that aren\'t in the target object (the first)',->
    output = etho.merge(obj1, obj2)
    output.should.not.have.property 'baz'

  it 'should return a "modded" clone of the target object',->
    output = etho.merge(obj1, obj2)
    obj1.should.have.property('foo').true
    output.should.have.property('foo').equal(obj2.foo)
    output.bar = 'altered'
    obj1.should.have.property('bar').not.equal 'altered'
    obj1.bar = 'test'
    output.should.have.property('bar').not.equal 'test'

  it 'should not merge values from different types',->
    output = etho.merge(obj1, obj2)
    output.number.should.not.be.equal obj2.number

  it 'should deep merge properties from arguments into the returned Object',->
    output = etho.merge(obj1, obj2)
    output.should.have.deep.property('arr.limb').equal obj2.arr.limb


describe 'x',->

  staticOutput = getARandomString()
  testValue = getARandomString()
  ancestorClassPrototype =
    foo: (@bar)->
    # baz: sinon.spy()
    father : (val)-> "father:#{val}"

  minimalClassPrototype =
    init: ->
      @
    test : (@attr)-> staticOutput
    baz : ()-> 'child'
    trans: (val)->
      console.log ChildClass.__super__.father val
      val

  try
    AncestorClass = etho.x('AncestorClass') ancestorClassPrototype
    ChildClass = etho.x('ChildClass', undefined, AncestorClass) minimalClassPrototype
    newObject = new ChildClass()
  catch e
    console.log e


  it 'should return a function that serve to populate the prototype of a new Class',->
    etho.x('AnotherClass').should.be.a 'function'

  it 'should allow to specify an ancestor class',->
    newObject.should.be.an.instanceof AncestorClass

  it 'should allow the new Class to call specific method from his ancestor',->
    newObject.father.should.be.a 'function'

  it 'should allow to call a method from the ancestor class, even if it hasn\'t been re-implemented', ->
    newObject.father.should.be.a 'function'


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

describe 'UMD header', ->
  define = sinon.spy()

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

  it 'shoud return a copy of an Object', ->
    etho.shallowCopy(obj1).should.be.deep.equal obj1

  it 'should return a copy without any reference to the source object', ->
    copy = etho.shallowCopy(obj1)
    copy.foo = false
    copy.bar = getARandomString()
    copy.arr.limb.push 'okok'
    obj1.foo.should.not.be.deep.equal copy

  it 'should be able to return a copy of an Array', ->
    limbs = obj1.arr.limb
    copy  = etho.shallowCopy(limbs)
    rsgout = getARandomString();
    limbs.push(rsgout);
    copy.indexOf(rsgout).should.be.equal -1

  it 'should throw an Error if the wrong type of arguments are passed', ->
    try
      etho.shallowCopy('okoko').should.throw 'Wrong Type.'


describe 'forEach',->
  _testArr = [1,2,3,4,5,6,7,8,9]
  _result = 0
  _expectedResult = 45

  it 'should give the ability to execute a function on each element of an Object',->
    etho.forEach _testArr, (val, index, list)->
      _result += val
    _result.should.be.equal _expectedResult

  it 'should throw an error if no array or object is passed to it', ->
    try
      etho.forEach().should.throw 'no object to iterate on !'



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

describe 'deepAccess',->

  obj =
    foo :
      bar :
        baz : [
          getARandomString(),
          getARandomString()
        ]

  it 'should allow to retrieve a value inside imbricated objects using a string path',->
    etho.deepAccess(obj, 'foo.bar.baz[0]').should.be.equal obj.foo.bar.baz[0]

  it 'should allow to alter a value inside imbricated objects using a string path',->
    stringTest = getARandomString()
    arr = etho.deepAccess(obj, 'foo.bar.baz')
    arr[0] = stringTest
    obj.foo.bar.baz[0].should.be.equal stringTest

  it 'should allow to execute a method from imbricated objects using a string path',->
    startLength = obj.foo.bar.baz.length
    etho.deepAccess(obj, 'foo.bar.baz').push(getARandomString())
    obj.foo.bar.baz.length.should.be.above startLength

  it 'should throw an error if no array or object is passed to it', ->
    try
      etho.deepAccess().should.throw 'no object to navigate inside !'

  it 'should throw an error if no path as string is passed to it', ->
    try
      etho.deepAccess(obj).should.throw Error

  it 'should throw an error if a wrong path is passed to it', ->
    try
      etho.deepAccess(obj, 'Lorem.ipsum').should.throw Error

describe 'x',->

  staticOutput = getARandomString()
  testValue = getARandomString()
  ancestorClassPrototype =
    defaultOptions:
      test: false
    foo: (@bar)->
    baz: sinon.spy()
    father : (val)-> "father:#{val}"

  ancestorClassPrototype2 =
    foo: (@bar)->
    baz: sinon.spy()
    father : (val)-> "father:#{val}"

  minimalClassPrototype =
    init: ->
      @
    test : (@attr)-> staticOutput
    baz : ()-> 'child'
    trans: (val)->
      @baz() + '|' + ChildClass.__super__.father(val) + '|' + @baz()

  minimalClassPrototype2 =
    defaultOptions:
      test: true
    test : (@attr)-> staticOutput
    baz : ()-> 'child'
    trans: (val)->
      @baz() + '|' + ChildClass.__super__.father(val) + '|' + @baz()

  try
    AncestorClass = etho.x('AncestorClass') ancestorClassPrototype
    AncestorClass2 = etho.x('AncestorClass2') ancestorClassPrototype2
    ChildClass = etho.x('ChildClass', undefined, AncestorClass) minimalClassPrototype
    ChildClass2 = etho.x('ChildClass2', undefined) minimalClassPrototype2
    newObject = new ChildClass()
  catch e
    console.log e

  it 'should take at least the classname as argument', ->
    try
      etho.x().should.throw 'classname is missing !'

  it 'should provide a mecanism to have default options overriden at instanciation type sensitive', ->
    (new AncestorClass({test:true})).options.test.should.be.ok

  it 'should override the default options in type sensitive manner only', ->
    (new AncestorClass({test:2})).options.test.should.not.be.equal 2

  it 'should save the constructor parameter as options if no defaultOptions are provided', ->
    (new AncestorClass2({test:2})).options.test.should.be.equal 2

  it 'should return a function that serve to populate the prototype of a new Class',->
    etho.x('AnotherClass').should.be.a 'function'

  it 'should allow to specify an ancestor class',->
    newObject.should.be.an.instanceof AncestorClass

  it 'should allow the new Class to call specific method from his ancestor',->
    newObject.trans('hello').should.be.equal 'child|father:hello|child'

  it 'should allow to call a method from the ancestor class, even if it hasn\'t been re-implemented', ->
    newObject.father.should.be.a 'function'

  it 'should not call a parent method during the inheritance process', ->
    ChildClass.__super__.baz.should.not.have.been.called

  it 'should provide a Lambda parent when no parent is provided', ->
    AncestorClass.__super__.should.be.an.instanceof Object

  it 'should provide a `__type__` attribute containing the classname', ->
    newObject.__type__.should.be.equal ChildClass.prototype.__type__

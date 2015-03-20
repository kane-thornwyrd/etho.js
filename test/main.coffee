inside = (what, from)=>
  if typeof window isnt 'undefined'
    window[what] = from
  else
    global[what] = from
we = (obj)-> obj
load = (thing)=> inside thing, we require thing

getARandomString = -> Math.random().toString(36).replace(/[^a-zA-Z]+/g, '')

inside '_', we require 'underscore'

inside 'etho', we require '../index'

load('chai').should()


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


describe 'isA',->

  it 'should be able to say if something is an Array',->
    etho.isA('Array',[]).should.be.true

  it 'should be able to say if something is an Object',->
    etho.isA('Object',{}).should.be.true

  it 'should be able to say if something is a String',->
    etho.isA('String','').should.be.true

  it 'should be able to say if something is a Number',->
    etho.isA('Number',42).should.be.true

  it 'should be able to say if something is a Boolean',->
    etho.isA('Boolean',true).should.be.true


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

  refObj1 = _.clone obj1

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
  ancestorClassName = 'TestAncestorClass'
  ancestorClassPrototype =
    foo: (@bar)->
    baz: ()-> 'ancestor'
    father : (val)-> "father:#{val}"

  minimalClassName = 'TestMinimalClass'
  minimalClassPrototype =
    test : (@attr)-> staticOutput
    baz : ()-> 'child'
    trans: (val)-> "child:#{@parentMethod 'father', val}:child"

  ancestorClass = etho.x(ancestorClassName, ->) ancestorClassPrototype
  childClass = etho.x(minimalClassName,ancestorClass, -> ) minimalClassPrototype
  newObject = new childClass()

  it 'should return a function that serve to populate the prototype of a new Class',->
    newObject.test.should.be.a 'function'
    newObject.test(testValue).should.be.equal staticOutput
    newObject.attr.should.be.equal testValue

  it 'should give the new Class a meta attribute containing at least his name',->
    newObject.should.be.an.instanceof childClass
    newObject.should.have.property 'meta'
    newObject.meta.name.should.be.equal minimalClassName

  it 'should allow to specify an ancestor class',->
    newObject.prototype.should.have.property 'meta'
    newObject.meta.name.should.be.equal minimalClassName
    newObject.parent.meta.name.should.not.be.equal minimalClassName

  it 'should allow the new Class to call specific method from his ancestor',->
    newObject.trans(testValue).should.be.equal "child:father:#{testValue}:child"

  it 'should allow to call a method from the ancestor class, even if it hasn\'t been re-implemented', ->
    newObject.father(testValue).should.be.equal "father:#{testValue}"


inside = (what, from)=>
  if typeof window isnt 'undefined'
    window[what] = from
  else
    global[what] = from
we = (obj)-> obj
load = (thing)=> inside thing, we require thing

inside 'etho', we require '../index'

load('chai').should()


describe 'ucfirst', ->

  _testStr = 'zdokzdjDZokdZO_dzdij-zdu'
  _oldChrCode = 0
  _newChrCode = 0

  it 'should return the string with the first letter uppercased', ->
    _oldChrCode = _testStr.charCodeAt(0)
    _newChrCode = etho.ucfirst(_testStr).charCodeAt(0)
    _newChrCode.should.be.equal _oldChrCode - 32

  it 'shouldn\'t change the case of the rest of the string', ->
    _testStr.substr(1).should.be.equal etho.ucfirst(_testStr).substr(1)


describe 'isA',->

  it 'should be able to say if an object is an Array',->
    etho.isA('Array',[]).should.be.true

  it 'should be able to say if an object is an Object',->
    etho.isA('Object',{}).should.be.true

  it 'should be able to say if an object is a String',->
    etho.isA('String','').should.be.true

  it 'should be able to say if an object is a Number',->
    etho.isA('Number',42).should.be.true

  it 'should be able to say if an object is a Boolean',->
    etho.isA('Boolean',true).should.be.true

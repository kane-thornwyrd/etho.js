etho.js
=======
[![Build Status](https://travis-ci.org/kane-thornwyrd/etho.js.svg)](https://travis-ci.org/kane-thornwyrd/etho.js) [![Dependency Status](https://gemnasium.com/kane-thornwyrd/etho.js.svg)](https://gemnasium.com/kane-thornwyrd/etho.js) [![Code Climate](https://codeclimate.com/github/kane-thornwyrd/etho.js/badges/gpa.svg)](https://codeclimate.com/github/kane-thornwyrd/etho.js) [![Coverage Status](https://coveralls.io/repos/kane-thornwyrd/etho.js/badge.svg?branch=master)](https://coveralls.io/r/kane-thornwyrd/etho.js?branch=master) [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

[![NPM](https://nodei.co/npm/etho.js.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/etho.js/)

My toolbox, forged to fit my needs, reading the jsjutsu's gurus papers.

Examples
--------

### etho.ucfirst

```javascript
  console.log(etho.ucfirst('foobar'));
  // Print 'Foobar' in the console.
```

###

### etho.x

#### Parent class.

```javascript
var ParentCl = etho.x({
  name: 'ParentCl',
  version: '0.1'
}, function ParentCl(value){
  console.log(this.meta.name, ' constructor !');
  console.log(this.meta);
  return this.init(value);
})({
  'init': function init(value){
    this.value = value;
    console.log(this.meta.name + 'Init !');
  },
  'baz' : function baz(arg){
    console.log(this.meta.name + ':baz this', this);
    return this.meta.name + ' ' + arg + ' ' + this.value + ' Baz'
  }
});
```

#### Child class.

```javascript
var ChildCl = etho.x('ChildCl', ParentCl, function ChildCl(value){
  console.log(this.meta.name, ' constructor !');
  console.log(this.meta);
  this.parentMethod('init')(value);
})({
  'baz' : function baz(){
    return 'Wrapped ' + this.parentMethod('baz')('Bob') + ' Up';
  }
});
```

### In action.
```javascript
var childCl = new ChildCl('Value that passe everywhere !!!');

console.log(bar.baz());
/** Output in console:
  ChildCl:baz this [Object(instance of ChildCl)]
  Wrapped ChildCl bob Up
**/
```

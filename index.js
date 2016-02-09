// # etho.js
//
// ## UMD.js wrapper.
(function (root, factory) {
    // AMD.
  if (typeof define === 'function' && define.amd) {
    define([], function () {
        return factory();
    });
    // Commonjs.
  } else if(typeof exports !== 'undefined'){
    exports = module.exports = factory();
    // Browser globals.
  } else {
    factory();
  }
}(this, function () {

// declaring the namespace.
  var etho = {};

  // ### ucfirst
  // Return the string passed as argument with the first letter uppercased.
  //
  // **Exemple**:
  // ```
  //etho.ucfirst('foo');
  //// Foo
  // ```
  etho.ucfirst = function ethoUcfirst(str){
    return str.substr(0,1).toUpperCase() + str.substr(1);
  };



  // ### getType
  // Return the *true* type of anything as a string.
  //
  // It always return the type "lowercase"d for consistency.
  //
  // **Exemples**:
  // ```
  //etho.getType('foo');
  //// "string"
  //etho.getType(3);
  //// "number"
  //etho.getType({});
  //// "object"
  //etho.getType([]);
  //// "array"
  //etho.getType(null);
  //// "null"
  //etho.getType(undefined);
  //// "undefined"
  // ```
  etho.getType = function ethoGetType(thing){
    return Object.prototype.toString.call(thing).match(/^\[object\s+(\w+)\]$/)[1].toLowerCase();
  };

  // ### toArraySliced
  // Try to transform anything into an array and slice it.
  //
  // **Exemples**:
  // ```
  //function test(param){
  //  var args = etho.toArraySliced(arguments);
  //  return param + "|" + args.length;
  //}
  //
  //test('foo')
  ////foo|1
  //test('foo','bar')
  ////foo|2
  // ```
  // ```
  //function test(param){
  //  var args = etho.toArraySliced(arguments, 1);
  //  return param + "|" + args.length;
  //}
  //
  //test('foo')
  ////foo|0
  //test('foo','bar')
  ////foo|1
  // ```
  // ```
  //function test(param, /* foo, bar,.. */ ctx){
  //  var args = etho.toArraySliced(arguments, 1, -1);
  //  return param + "|" + args.length + "|" + ctx;
  //}
  //
  //test('foo', 'bar')
  ////foo|0|bar
  //test('foo', 'baz', 'bar')
  ////foo|1|bar
  // ```
  etho.toArraySliced = function ethoToArraySliced(obj, sliceStart, sliceEnd){
    sliceStart = sliceStart || 0;
    if(etho.isA('undefined', sliceEnd)){
      return Array.prototype.slice.call(obj, sliceStart);
    }else{
      return Array.prototype.slice.call(obj, sliceStart, sliceEnd);
    }
  };


  // ### isA
  // Check the type of anything against the supposed type as a string.
  //
  // **Exemples**:
  // ```
  //etho.isA('string', "foo")
  //// true
  //
  //etho.isA('string', {})
  //// false
  // ```
  etho.isA = function ethoIsA(type, obj){
    return etho.getType(obj) === type;
  };


  // ### shallowCopy
  // __Recursively deep copy__ an `array` or an `object` without any reference left !
  //
  // **Exemple**:
  // ```
  //var foo = {
  //  arr : {
  //    pirate : true,
  //    fakelimb   : [
  //      'leftHand'
  //    ]
  //  }
  //}
  //
  //var bar = etho.shallowCopy(foo)
  //
  //bar.arr.fakelimb.push('eye')
  //
  //foo.arr.fakelimb.length
  ////1
  //
  //bar.arr.fakelimb.length
  ////2
  // ```
  etho.shallowCopy = function ethoShallowCopy(obj){
    var out = {};
    switch(etho.getType(obj)){
      case 'array':
        return etho.toArraySliced(obj);
      case 'object':
        for (var key in obj){
          if(
            etho.isA('array',obj[key]) ||
            etho.isA('object',obj[key])
          ){
            out[key] = etho.shallowCopy(obj[key]);
          }else{
            out[key] = obj[key];
          }
        }
      break;
      default:
        throw new Exception('Wrong Type.');
    };
    return out;
  };


  // ### forEach
  // Run an iterator against each entries of an array or an object.
  //
  // **Exemple**:
  // ```
  //var foo = [1,2,3,4,5,6,7,8,9], out = 0;
  //etho.forEach(foo, function(val, key, list){ out += val; });
  //// out === 45
  // ```
  etho.forEach = function ethoForeach(obj, iterator, context) {

    if (obj === null){ throw new Error('no object to iterate on !');}

    if(typeof context === 'undefined'){ context = this; }

    for (var key in obj) {
      if ({}.hasOwnProperty.call(obj, key)) {
        iterator.call(context, obj[key], key, obj);
      }
    }

    return obj;
  };


  // ### merge
  //
  // Recursively an type-checked merge things. Useful to enforce defaultOptions
  // types in Classes Instances !
  //
  // No parameters are affected, it return a shallowCopy of the first merged with
  // the nexts !
  //
  // **Exemple**:
  // ```
  //var foo = {
  //  arr : {
  //    pirate : false,
  //    fakelimb   : [
  //      'leftHand'
  //    ]
  //  }
  //};
  //
  //var bar = {
  //  arr : {
  //    pirate : true,
  //    fakelimb   : false
  //  }
  //};
  //
  //var result = etho.merge(foo, bar);
  //
  ////result => {arr:{pirate:true,fakelimb:['leftHand']}}
  //
  // ```
  etho.merge = function ethoMerge(target, seed/*, seed*… */){
    var _return = etho.shallowCopy(target);
    if(etho.isA('undefined', seed)){ return _return; }
    var args = etho.toArraySliced(arguments, 1);
    for (var i = 0; i < args.length; i++) {
      var src = args[i];
      for (var prop in _return) {
        if (
          _return.hasOwnProperty(prop) &&
          !etho.isA('function',_return[prop]) &&
          etho.getType(_return[prop]) === etho.getType(src[prop])
        ){
          switch(etho.getType(_return[prop])){
            case 'object':
              _return[prop] = etho.merge(_return[prop], src[prop]);
            break;
            default:
              _return[prop] = src[prop];
          }
        } else { continue; }
      }
    }
    return _return;
  };


  // ### inherit
  //
  //
  // **Exemple**:
  // ```
  // ```
  etho.inherit = function ethoInherit(child, parent) {
    for (var key in parent) {
      if ({}.hasOwnProperty.call(parent, key)){
        child[key] = parent[key];
      }
    }

    var wrapper = function wrapper() { this.constructor = child; }

    wrapper.prototype = parent.prototype;
    child.prototype = new wrapper();
    child.__super__ = parent.prototype;
    return child;
  };


  // ### x
  //
  //
  // **Exemple**:
  // ```
  // ```
  etho.x = function ethoX(classname, customConstructor, parentClass){
    var args = etho.toArraySliced(arguments, 1);

    if(args.length === 0){
      parentClass = function Lambda(){};
    }

    var CHILD = this[classname] = customConstructor || etho.x.minimalConstructor();


    if(etho.isA('undefined', classname)){
      throw new Error('classname is missing !');
    }

    if(etho.isA('undefined', parentClass)){
      parentClass = function Lambda(){};
    }

    return function protoCreation(proto){

      return (function(parent){
        etho.inherit(CHILD, parent);

        for(var attr in proto){
          if( proto.hasOwnProperty( attr ) ) {
            CHILD.prototype[attr] = proto[attr];
          }
        }

        var autoSuper = function autoSuper(method){
          if(
            !etho.isA('undefined', CHILD.__super__) &&
            etho.isA('undefined', CHILD.__super__[method])
          ){
            return CHILD.__super__[method];
          }
        };

        for(var oldattr in parent){
          if( parent.hasOwnProperty( oldattr ) ) {
            CHILD.prototype[oldattr] = autoSuper(oldattr);
          }
        }

        return CHILD;

      })(parentClass);
    }
  };


  // ### x.minimalConstructor
  //
  //
  // **Exemple**:
  // ```
  // ```
  etho.x.minimalConstructor = function(){ return function ethoGenericConstructor(options){
    if(this.defaultOptions){
      this.options = etho.merge(this.defaultOptions, options);
    }else{
      this.options = options;
    }
    if( this.init ){ this.init(); }
    if( this.listen ){ this.listen(); }
    return this;
  };};

  return etho;
}));

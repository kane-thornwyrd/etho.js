(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function () {
        return factory();
    });
  } else if(typeof exports !== 'undefined'){
    exports = module.exports = factory();
  } else {
    // Browser globals
    factory();
  }
}(this, function () {

  var etho = {};

  etho.ucfirst = function ethoUcfirst(str){
    return str.substr(0,1).toUpperCase() + str.substr(1);
  };

  etho.getType = function ethoGetType(thing){
    return Object.prototype.toString.call(thing).match(/^\[object\s+(\w+)\]$/)[1].toLowerCase();
  };

  etho.toArraySliced = function ethoToArraySliced(obj, sliceStart, sliceEnd){
    sliceStart = sliceStart || 0;
    if(etho.isA('undefined', sliceEnd)){
      return Array.prototype.slice.call(obj, sliceStart);
    }else{
      return Array.prototype.slice.call(obj, sliceStart, sliceEnd);
    }
  };

  etho.isA = function ethoIsA(type, obj){
    return etho.getType(obj) === type;
  };

  etho.shallowCopy = function ethoShallowCopy(obj){
    var out = {};
    switch(etho.getType(obj)){
      case 'array':
        return etho.toArraySliced(obj);
      break;
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

  etho.forEach = function ethoForeach(obj, iterator, context) {
    if (obj === null){ return;}
    if(typeof context === 'undefined'){ context = this; }
    if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === {}){ return;}
      }
    } else {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === {}){ return;}
        }
      }
    }
    return obj;
  };

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
          typeof _return[prop] === typeof src[prop]
        ){
          switch(Object.prototype.toString.call(_return[prop])){
            case '[object Object]':
              _return[prop] = etho.merge(_return[prop], src[prop]);
            break;
            case '[object Undefined]':
              continue;
            default:
              _return[prop] = src[prop];
          }
        } else { continue; }
      }
    }
    return _return;
  };

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

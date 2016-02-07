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

  etho.x = function ethoX(nameForNewClass /*, parentClass , customConstructor*/){


    var
      baseMeta = {
        name    : '',
        version : '0.0.1-dev'
      },
      product = {},
      _inheritance = false
    ;

    if(!etho.isA('string', nameForNewClass)){
      nameForNewClass = etho.merge(baseMeta, nameForNewClass );
    } else {
      nameForNewClass = etho.merge(baseMeta, {
        name : nameForNewClass
      });
    }

    var args = etho.toArraySliced(arguments);

    switch(args.length){
      case 1:
        _minimal.apply(this, args);
      break;
      case 2:
        _customConstructor.apply(this, args);
      break;
      case 3:
        _fullFledged.apply(this, args);
      break;
      default:
        throw new Error('Wrong arguments in etho.x !');
    }



    function parentInvoke(method){
      if(typeof this.parent[method] !== 'undefined'){
        return this.parent[method].apply(this, etho.toArraySliced(arguments, 1));
      }
      return null;
    };


    function _minimal(nameForNewClass){
      product = etho.x.minimalConstructor;
      product.prototype.parent = {};
      product.prototype.constructor = etho.x.minimalConstructor;
      product.prototype.parentMethod = parentInvoke;

    }


    function _customConstructor(nameForNewClass, customConstructor){
      product = customConstructor;
      product.prototype.parent =  {};
      product.prototype.constructor = customConstructor;
      product.prototype.parentMethod = parentInvoke;
    }


    function _fullFledged(nameForNewClass, parentClass, customConstructor){
      product = customConstructor;
      var _t = Object.create(parentClass);
      product.prototype = _t;
      product.prototype.parent = parentClass.prototype;
      product.prototype.constructor = customConstructor;
      product.prototype.parentMethod = parentInvoke;
    }


    var prototypeEnrichment = function _prototypeEnrichment(newMethods){
      for(var attr in newMethods){
        if( newMethods.hasOwnProperty( attr ) ) {
          product.prototype[attr] = newMethods[attr];
        }
      }

      var _functionFilter = function(val, k, obj){return etho.isA('function',val);};

      for(var meth in product.prototype.parent){
        if(product.prototype.parent.hasOwnProperty(meth)){
          if(typeof product.prototype[meth] === 'undefined'){
            product.prototype[meth] = function autoInheritedMethod(){
              var args = etho.toArraySliced(arguments);
              args.unshift(meth);
              return parentInvoke.apply(this, args);
            };
          }
        }
      }
      return product;
    };
    product.prototype.meta = nameForNewClass;




    return prototypeEnrichment;
  };

  etho.x.minimalConstructor = function ethoGenericConstructor(options){
    if(this.defaultOptions){
      this.options = etho.merge(this.defaultOptions, options);
    }else{
      this.options = options;
    }
    if( this.init ){ this.init(); }
    if( this.listen ){ this.listen(); }
    return this;
  }

  return etho;
}));

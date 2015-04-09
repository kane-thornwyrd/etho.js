/* global _ */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['underscore'], function (_) {
        return factory(_);
    });
  } else if(typeof exports !== 'undefined'){
    var _ = require('underscore');
    exports = module.exports = factory(_);
  } else {
    // Browser globals
    factory(_);
  }
}(this, function (_) {

  //http://javascript.crockford.com/prototypal.html
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
  // It's not a good polyfill, miss the properties parameter
  // TODO EVOLVE
  if (typeof Object.create != 'function') {
    Object.create = (function() {
      var Temp = function() {};
      return function (prototype) {
        if (arguments.length > 1) {
          throw Error('Second argument not supported');
        }
        if (typeof prototype != 'object') {
          throw TypeError('Argument must be an object');
        }
        Temp.prototype = prototype;
        var result = new Temp();
        Temp.prototype = null;
        return result;
      };
    })();
  }

  var etho = {};

  etho.ucfirst = function(str){
    return str.substr(0,1).toUpperCase() + str.substr(1);
  };

  etho.isA = function(type, obj){
    return Object.prototype.toString.call(obj) === '[object ' + etho.ucfirst(type) + ']';
  };

  etho.forEach = function(obj, iterator, context) {
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
  };

  etho.merge = function ethoMerge(target, seed/*, seed*… */){
    var _return = _.clone(target);
    if(_.isUndefined(seed)){ return _return; }
    var args = _.toArray(arguments).slice(1);
    for (var i = 0; i < args.length; i++) {
      var src = args[i];
      for (var prop in _return) {
        if (
          _return.hasOwnProperty(prop) &&
          !_.isFunction(_return[prop]) &&
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

    var args = _.toArray(arguments);

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
        return this.parent[method].apply(this, _.toArray(arguments).slice(1));
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
              console.log('PARENT METHOD', this);
              var args = _.toArray(arguments);
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

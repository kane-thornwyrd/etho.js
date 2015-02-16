/*global _*/
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
          // J'utilise la représentation textuelle et pas typeof pour conserver
          // l'homogénéïté des tests puisque typeof [] est "object"
          switch(Object.prototype.toString.call(_return[prop])){
            case '[object Array]':
            case '[object Object]':
              etho.merge(_return[prop], src[prop]);
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

  etho.x = function ethoX(nameForNewClass, parent, child){
    // console.debug('Etho.x args', arguments);

    if(_.isUndefined(child)){
      child = parent;
      parent = {};
    }

    if(!etho.isA('function',child)){
      child = function(options){
        if(this.defaultOptions){
          this.options = etho.merge(this.defaultOptions, options);
        }else{
          this.options = options;
        }
        // console.debug('Etho autoconstructor ', this, arguments);
        if( this.init ){ this.init(); }
        if( this.listen ){ this.listen(); }
        return this;
      };
    }

    var parentMethod = function parentInvoke(method){
      if(typeof parent[method] !== 'undefined'){
        return parent[method].apply(this, Array.prototype.slice.call(arguments, 1));
      }
      return null;
    };
    if ( parent.constructor == Function ){
      child.prototype = new parent;
      child.prototype.constructor = child;
      child.prototype.parent = parent.prototype;
      child.prototype.parent.parentMethod = parentMethod;
    } else {
      child.prototype = parent;
      child.prototype.constructor = child;
      child.prototype.parent = parent;
    }

    child.prototype.meta = {
      name: '',
      version: ''
    };

    if(!etho.isA('string', nameForNewClass)){
      child.prototype.meta = etho.merge(child.prototype.meta, nameForNewClass);
    } else {
      child.prototype.meta['name'] = nameForNewClass;
      child.prototype.meta['version'] = '0.0.1-dev';
    }

    return function prototypeEnrichment(newMethods){
      etho.forEach(newMethods, function(value, key, list){
        child.prototype[key] = value;
      });
      return child;
    };
  };


/*
var Foo = etho.x({
  name: 'Foo',
  version: '0.1'
}, function Foo(value){
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

var Bar = etho.x('Bar', Foo, function Bar(value){
  console.log(this.meta.name, ' constructor !');
  console.log(this.meta);
  this.parentMethod('init')(value);
})({
  'baz' : function baz(){
    return 'Wrapped ' + this.parentMethod('baz')('Bob') + ' Up';
  }
});

var bar = new Bar('Value that passe everywhere !!!');

console.log(bar.baz());
*/

  return etho;
}));

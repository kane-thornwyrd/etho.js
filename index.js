(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], function (exports) {
            return factory((root.commonJsStrictGlobal = exports));
        });
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(exports);
    } else {
        // Browser globals
        factory((root.commonJsStrictGlobal = {}));
    }
}(this, function (exports) {

  var etho = {};

  etho.instanceOf = function instanceOf(_obj, ancestor) {
    while (_obj != null) { if (_obj == ancestor.prototype){ return true; }
      _obj = _obj.__proto__;
    }
    return false;
  }

  etho.forEach = function(obj, iterator, context) {
    if (obj == null){ return;}
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

  etho.x = function ethoX(nameForNewClass, parent, child){
    console.debug('Etho.x args', arguments);

    if(!child){
      child = parent;
      parent = {};
    }

    if(typeof child !== 'function'){
      child = function(el, options){
        this.el = el;
        this.options = options;
        console.debug(nameForNewClass +' autoconstructor', this.meta, arguments);
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

    child.prototype.meta = {};

    if(typeof nameForNewClass !== 'string'){
      etho.forEach(nameForNewClass, function(value, key, list){
        child.prototype.meta[key] = value;
      });
    } else {
      child.prototype.meta.name = nameForNewClass;
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
  exports.etho = etho;
  return etho;
}));

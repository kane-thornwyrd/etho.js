var etho = etho || {};

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

etho.x = function ethoX(parent, child){

  if(!child){
    child = parent;
    parent = Object;
  }

  var parentMethod = function parentInvoke(method){
    if(typeof this.parent[method] !== 'undefined'){
      return this.parent[method].bind(this);
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
  return function prototypeEnrichment(newMethods){
    etho.forEach(newMethods, function(value, key, list){
      child.prototype[key] = value;
    });
    return child;
  };
}


var Foo = etho.x(function Foo(){
})({
  'baz' : function baz(arg){
    console.log('Foo:baz this', this);
    return 'Foo ' + arg + ' Baz'
  }
});

var Bar = etho.x(Foo, function Bar(){
})({
  'baz' : function baz(){
    return 'Wrapped ' + this.parentMethod('baz')('Bob') + ' Up';
  }
});

var bar = new Bar();

console.log(bar.baz());

define-strict-properties
========================

defining types in JavaScript via ES5 compatible descriptors

[![build status](https://secure.travis-ci.org/WebReflection/define-strict-properties.png)](http://travis-ci.org/WebReflection/define-strict-properties)


### Object.defineProperties(obj, typedProperties)
Following all goals of this project:

  * **zero performance impact**, all you have to do is to not include [the main file](build/define-strict-properties.max.js) in production
  * **fully ES5 backward compatible**, it works with [ES5 descriptors](http://www.ecma-international.org/ecma-262/5.1/#sec-8.10) already in your code, nothing to change
  * **methods and signatures overload**, you can accept one or more arguments and of different type, just specify them
  * **multiple returns type**, you can return one or more variable type
  * **no syntax changes**, which means no broken JavaScript, no need for transpilers, no need for source maps, no need for ... you name it, it's just JavaScript with the ability to specify types via descriptors!
  

### Regular ES5 Descriptors
ES5 descriptors are objects usually created at runtime able to define properties in a powerful way.
Following a quick summary about ES5 descriptors:

```javascript
Object.defineProperty(genericObject, {

  // will it show up in for/in or in Object.keys() ?
  enumerable: true,   // false by default
  // is it possible to redefine this value 
  // using Object.defineProperty again ?
  configurable: true, // false by default


  // defining property directly

  // specify if the value can change at runtime
  writable: true,     // false by default
  // the property value
  value: any,


  // defining property via getters/setters
  // (no writable allowed by specs)

  // the getter, returns anything, even methods
  get: function () {
    return any;
  },

  // the setter, will receive the set value
  // obj.prop = anyValue;
  set: function (anyValue) {
    any = anyValue;
  }

});
```


### Enriched ES5 Descriptors
If you include [define-strict-properties](build/define-strict-properties.max.js) before other scripts, you'll be able to do more with descriptors preserving native ES5 behavior.


### Types
These are the types that work exactly the same when specified as `arguments`, `returns`, or `type` fields in the descriptor.

  * **"boolean"**, as `typeof obj === 'boolean'`
  * **"function"**, as `typeof obj === 'function'`
  * **"number"**, as `typeof obj === 'number'`
  * **"object"**, as `typeof obj === 'object'`, including `null`, no surprises here
  * **"string"**, as `typeof obj === 'string'`
  * **"undefined"**, as `typeof obj === 'undefined'`, it looks pointless but it can actually become handy if there is some property that should be flagged as _reserved_ and accessing it should throw an error
  * **"any"**, as any kind of value, it will accept really anything, basically a white `typeof` flag
  * **Constructor**, validated as `obj instanceof Constructor`
  * **genericObject**, validated as `genericObject.isPrototypeOf(obj)`, particularly handy if you use `Object.create(fromObject)` instead of constructors for new objects instead of using classes

Following few examples on how to use them.

### Typed Value
```javascript
// basic descriptor example
Object.defineProperty(genericObject, {
  type: 'number',
  writable: true,
  value: 123
});

// via multiple descriptors
Object.defineProperties({}, {
  method: {
    type: 'function',
    writable: true,
    value: function () {
      // it can be change even later on
      // with another method
    }
    // keep reading for arguments
    // and returns type
  },
  property: {
    type: 'string',
    value: 'Hello There!'
  },
  instance: {
    type: HTMLElement,
    value: document.createElement('canvas')
  },
  proto: {
    type: someObjectThatIsPrototypeOf,
    value: anotherOne
  }
});
```

### Methods `arguments`
```javascript

function Person(name) {
  this.name = name;
}

Object.defineProperties(
  Person.prototype, {

  // some property
  // it's that easy to ensure types
  title: {
    type: 'string',
    value: '' // as default
  },
  age: {
    type: 'number',
    value: 0
  },
  name: {
    type: 'string'
  },

  // methods are easily
  // ensured by default as not enumerable
  // not configurable and not writable
  // so that is not possible to change
  // them during a class lifecycle
  // and this is normal ES5 behavior ;-)
  promoteTo: {
    // only one argument, as string
    arguments: ['string'],
    value: function (title) {
      this.title = title + ' ';
    }
  },

  toString: {
    returns: ['string'],
    value: function () {
      return this.title + this.name;
    }
  }

});

var me = new Person('Andrea');
me.promoteTo('Mr');
me.age = 35;
console.log('' + me); // Mr Andrea
```
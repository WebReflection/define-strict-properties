define-strict-properties
========================

defining types in JavaScript via ES5 compatible descriptors

[![build status](https://secure.travis-ci.org/WebReflection/define-strict-properties.png)](http://travis-ci.org/WebReflection/define-strict-properties)


### Object.create(proto, typedProperties)
Following all goals of this project:

  * **zero performance impact**, all you have to do is to **not** include [the main file](build/define-strict-properties.max.js) in production
  * **fully ES5 backward compatible**, it works with [ES5 descriptors](http://www.ecma-international.org/ecma-262/5.1/#sec-8.10) already in your code, nothing to change
  * **methods and signatures overload**, you can accept one or more arguments and of different type, just specify them
  * **multiple returns type**, you can return one or more variable type
  * **no syntax changes**, which means no broken JavaScript, no need for transpilers, no need for source maps, no need for ... you name it, it's just vanilla JavaScript with the ability to specify types via descriptors!

As extra ideal goal, JS documentation tools could use these descriptors to simplify the generation of the documentation per each _class_ structure.

Moreover, as virtual ideal goal bonus, JavaScript engines could follow this proposal to boost up performance via typed properties, in a similar way property access is planned to be optimized in [Typed Object](http://wiki.ecmascript.org/doku.php?id=harmony:typed_objects) anyway, except this proposal is also suitable for runtime operations instead of static shapes only.

Last but not least, this project could also be used to actually implement [`StructType` polyfills](src/StructType.js) for ES5 compatible engines.

### Compatibility
Every engine that is compatible with ES5 specifications, including:

  * IE9+, and IEMobile 9+
  * any Webkit based browser (Safari, Android 2+, iOS 5+, Kindle Silk, Blackberry, PhantomJS, webOS, etc, etc)
  * any Chrome and Mobile Chrome,
  * any Opera 12+ plus mobile and mini
  * nodejs, Rhino, DynJS, I believe any updated server side JS engine too

To check if your browser supports this script without extra polyfills, feel free to [check the test page](http://webreflection.github.io/define-strict-properties/test/).

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
If you include [define-strict-properties](build/define-strict-properties.max.js) before other scripts in your development environment, you'll be able to do more with descriptors preserving native ES5 behavior.


### Types
These are the types that work exactly the same when specified as `arguments`, `returns`, or `type` fields in the descriptor.

  * **"boolean"**, as `typeof obj === 'boolean'`
  * **"function"**, as `typeof obj === 'function'`
  * **"number"**, as `typeof obj === 'number'`
  * **"object"**, as `typeof obj === 'object'`, including `null`, no surprises here, is still JS as it is
  * **"string"**, as `typeof obj === 'string'`
  * **"undefined"**, as `typeof obj === 'undefined'`, it looks pointless but it can actually become handy if there is some property that should be flagged as _reserved_ and accessing it should throw an error
  * **"any"**, as any kind of value, it will accept really anything, basically a white flag for the typeof filter
  * **Constructor**, validated as `obj instanceof Constructor`
  * **genericObject**, validated as `genericObject.isPrototypeOf(obj)`, particularly handy if you use `Object.create(fromObject)` instead of constructors for new objects instead of classes

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
var typed = Object.create(null, {
  method: {
    type: 'function',
    writable: true,
    value: function () {
      // it can be changed even later on
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

  // properties
  // easy to ensure types
  title: {
    writable: true,
    type: 'string',
    value: '' // as default
  },
  age: {
    writable: true,
    type: 'number',
    value: 0
  },
  name: {
    writable: true,
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

### License
A classic [MIT Style License](./LICENSE.txt)
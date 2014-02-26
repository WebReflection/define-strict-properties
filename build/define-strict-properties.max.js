/*!
Copyright (C) 2010 - 2014 by WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
(function (Object) {'use strict';
if (Object.defineStrict) return;

var
  ObjectPrototype = Object.prototype,
  defineProperty = Object.defineProperty,
  defineProperties = Object.defineProperties,
  hasOwnProperty = ObjectPrototype.hasOwnProperty,
  isPrototypeOf = ObjectPrototype.isPrototypeOf,
  toString = ObjectPrototype.toString,
  objectArray = toString.call([]),
  isArray = Array.isArray || function (a) {
    return toString.call(a) === objectArray;
  }
;

Object.defineStrict = true;
Object._defineProperty = defineProperty;
Object._defineProperties = defineProperties;
Object.defineProperty = defineStrictProperty;
Object.defineProperties = defineStrictProperties;

function argumentsVerifier(types, method) {
  return function () {
    return hasValid(types, arguments) &&
           method.apply(this, arguments);
  };
}

function argumentsWrapper(descriptor) {
  var
    types = descriptor.arguments,
    i = types.length || 1,
    get
  ;
  while (i--) {
    if (!isArray(types[i])) {
      types = [types];
      break;
    }
  }
  if ('value' in descriptor) {
    descriptor.value = argumentsVerifier(
      types,
      descriptor.value
    );
  } else {
    get = descriptor.get;
    descriptor.get = function () {
      return argumentsVerifier(
        types,
        get.call(this)
      );
    };
  }
}

function clone(old) {
  var descriptor = {}, key;
  for (key in old) {
    if (hasOwnProperty.call(old, key)) {
      descriptor[key] = old[key];
    }
  }
  return descriptor;
}

function defineStrictProperty(obj, key, descriptor) {
  var get, set;
  // inevitable if descriptors will be recycled out there
  // modifying them here would be too obtrusive
  descriptor = clone(descriptor);
  // only if specified
  if ('type' in descriptor) {
    get = 'get' in descriptor;
    set = 'set' in descriptor;
    if (!(get || set)) {
      getAndSetValue(descriptor);
    } else {
      if (get) {
        getWrapper(descriptor);
      }
      if (set) {
        setWrapper(descriptor);
      }
    }
  }
  if ('arguments' in descriptor) {
    argumentsWrapper(descriptor);
  }
  if ('returns' in descriptor) {
    returnsWrapper(descriptor);
  }
  return defineProperty(obj, key, descriptor);
}

function defineStrictProperties(obj, descriptors) {
  var key;
  for (key in descriptors) {
    if (hasOwnProperty.call(descriptors, key)) {
      defineStrictProperty(obj, key, descriptors[key]);
    }
  }
  return obj;
}

function getAndSetValue(descriptor) {
  var
    verify = 'value' in descriptor,
    value = descriptor.value, // type: 'undefined'
    type  = descriptor.type
  ;
  // if not writable it's actually pointless
  // to operate over a value that should never change
  if (descriptor.writable && (
    !verify || isValid(type, value)
  )) {

    // use get and set instead of value
    delete descriptor.value;
    delete descriptor.writable;

    // nothing really to do here
    // the value cannot be changed outside
    // this closure so if it pass the isValid
    // check in the set(newValue) then
    // it will be already validated as getter
    descriptor.get = function get() {
      return value;
    };

    // so here is where the only check is performed
    descriptor.set = function set(newValue) {
      if (isValid(type, newValue)) {
        value = newValue;
      }
    };

  }
}

function getWrapper(descriptor) {
  var
    type = descriptor.type,
    get = descriptor.get,
    result
  ;
  descriptor.get = function () {
    result = get.call(this);
    return isValid(type, result) && result;
  };
}

function hasValid(groups, args) {
  for (var
    l,
    types,
    total,
    sameLength,
    length = args.length,
    i = groups.length;
    i--;
  ) {
    types = groups[i];
    for (
      total = types.length,
      sameLength = total === length,
      l = total;
      l--;
    ) {
      try {
        isValid(types[l], args[l]);
        total--;
      } catch(andMoveOn) {
        break;
      }
    }
    if (!total && sameLength) {
      return true;
    }
  }
  throw new Error(
    'expected ' + groups +
    ' received ' + groups.slice.call(args)
  );
}

function isValid(expected, value) {
  var
    type = typeof expected,
    tv = typeof value
  ;
  if (
    (type === 'string' && tv === expected || expected === 'any') ||
    (type === 'function' && (value instanceof expected)) ||
    (type === 'object' && (
      (expected !== null && isPrototypeOf.call(expected, value)) ||
      (expected === null && value === expected)
    )) ||
    (type === 'undefined' && tv === type)
  ) {
    return true;
  }
  throw new Error('expected ' + expected + ' received ' + value);
}

function returnsVerifier(types, method) {
  return function () {
    for (var
      result = method.apply(this, arguments),
      total = types.length,
      i = total;
      i--;
    ) {
      try {
        isValid(types[i], result);
        return result;
      } catch(nothingToDohere) {}
    }
    throw new Error(
      'expected ' + types +
      ' returned ' + result
    );
  };
}

function returnsWrapper(descriptor) {
  var
    types = descriptor.returns,
    get
  ;
  if (!isArray(types)) {
    types = [types];
  }
  if ('value' in descriptor) {
    descriptor.value = returnsVerifier(
      types,
      descriptor.value
    );
  } else {
    get = descriptor.get;
    descriptor.get = function () {
      return returnsVerifier(
        types,
        get.call(this)
      );
    };
  }
}

function setWrapper(descriptor) {
  var
    type = descriptor.type,
    set = descriptor.set
  ;
  descriptor.set = function (newValue) {
    if (isValid(type, newValue)) {
      set.call(this, newValue);
    }
  };
}

}(Object));
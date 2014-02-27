
var
  ObjectPrototype = Object.prototype,
  create = Object.create,
  defineProperty = Object.defineProperty,
  defineProperties = Object.defineProperties,
  hasOwnProperty = ObjectPrototype.hasOwnProperty,
  isPrototypeOf = ObjectPrototype.isPrototypeOf,
  toString = ObjectPrototype.toString,
  objectArray = toString.call([]),
  getPrototypeOf = Object.getPrototypeOf || function (o) {
    return o.__proto__ || ObjectPrototype;
  },
  isArray = Array.isArray || function (a) {
    return toString.call(a) === objectArray;
  }
;

// flags the presence of this library
Object.defineStrict = true;

// save original methods
Object._create = create;
Object._defineProperty = defineProperty;
Object._defineProperties = defineProperties;

// replace them with strict version of them
Object.create = createStrict;
Object.defineProperty = defineStrictProperty;
Object.defineProperties = defineStrictProperties;

// returns a function that will
// check all typed arguments
// and will invoke the original callback
// only if arguments were valid
function argumentsVerifier(types, method) {
  return function () {
    return hasValid(types, arguments) &&
           method.apply(this, arguments);
  };
}

// wrap callbacks inside the function
// created via argumentsVerifier
function argumentsWrapper(descriptor) {
  var
    types = descriptor.arguments,
    i = types.length || 1,
    get
  ;
  // it tries to simplify life
  // when there are no groups of arguments, i.e.
  //  {arguments: ['string', 'number'],
  //   value: function(name, age) { /* ... */ }}
  // NOTE: in case you expect exactly an Array object
  // that should be the prototype of the received argument
  // it's better to pass it as a group [[myArrPrototype]]
  // instead of just one single group [myArrPrototype]
  // this is an edge case though but it might be
  // the reason specs would ask for groups only
  // avoiding any possible ambiguity
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

// in order to not change original descriptors
// clone them to be as less obtrusive as possible
// this is inevitable if descriptors will be recycled out there
// or reused as objects in any possible way
function clone(old) {
  // did you know? descriptors by "accident"
  // might suffer from inherited properties
  // such get, set, writable and others
  // here this "gotcha" is replicated
  // in the same way to keep the environment
  // as close to ES5 as possible
  var
    descriptor = create(
      // that's why inheritance is preseved
      getPrototypeOf(old)
    ),
    key
  ;
  for (key in old) {
    if (hasOwnProperty.call(old, key)) {
      descriptor[key] = old[key];
    }
  }
  return descriptor;
}

// the replacemente for the public
// Object.create(proto[, descriptor]) method
function createStrict(proto, descriptors) {
  var result = create(proto);
  return 1 < arguments.length ?
    defineStrictProperties(result, descriptors) :
    result;
}

// the replacemente for the public
// Object.defineProperty(obj, propName, propDescriptor) method
function defineStrictProperty(obj, key, descriptor) {
  var get, set;
  descriptor = clone(descriptor);
  // only if a type is specified
  if ('type' in descriptor) {
    // implement the type logic
    get = 'get' in descriptor;
    set = 'set' in descriptor;
    if (!(get || set)) {
      getAndSetValue(key, descriptor);
    } else {
      if (get) {
        getWrapper(descriptor);
      }
      if (set) {
        setWrapper(descriptor);
      }
    }
  }
  // arguments and returns are accepted
  // regardless the type, handy for classes
  // and prototype definition
  if ('arguments' in descriptor) {
    argumentsWrapper(descriptor);
  }
  if ('returns' in descriptor) {
    returnsWrapper(descriptor);
  }
  return defineProperty(obj, key, descriptor);
}

// the replacemente for the public
// Object.defineProperties(obj, descriptors) method
function defineStrictProperties(obj, descriptors) {
  var key;
  for (key in descriptors) {
    if (hasOwnProperty.call(descriptors, key)) {
      defineStrictProperty(obj, key, descriptors[key]);
    }
  }
  return obj;
}

// when no get/set are specified
function getAndSetValue(name, descriptor) {
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

    // force it configurable for type fucntion
    // classes methods usually should never need
    // writable and configurable methods though
    // this is for special cases like handleEvent
    // or other method changed at runtime
    // these need to be reconfigured with same
    // properties once re-assigned
    if (type === 'function') {
      descriptor.configurable = true;
    }

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
        if (type === 'function') {
          // reverse the operation
          delete descriptor.get;
          delete descriptor.set;
          // assign new values
          descriptor.value = newValue;
          descriptor.writable = true;
          // re-configure the property
          defineStrictProperty(this, name, descriptor);
        } else {
          value = newValue;
        }
      }
    };

  }
}

// wraps the descriptor.get
// and verify the returning type
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

// check if a list of groupped arguments
// matches those used to invoke the function
// **trows** if fails
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

// verify that a value is an expected type
// **trows** if fails
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

// create a function that will invoke the method
// and after check that the returned value
// is an expected one from the list of expected types
// **trows** if fails
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

// configure the descriptor in order to use
// the returnsVerifier created function
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

// wraps the descriptor.set
// and verify the received type
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

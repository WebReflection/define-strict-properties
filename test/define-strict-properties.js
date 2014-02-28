//remove:
require('../build/define-strict-properties.js');
//:remove

function fail(what) {
  wru.assert('epic fail with ' + what, false);
}

wru.test([
  {
    name: 'properties',
    test: function () {
      var
        obj = {},
        o = Object.create(
          null, {
          str: {
            writable: true,
            type: 'string',
            value: 'abc'
          },
          bln: {
            writable: true,
            type: 'boolean',
            value: true
          },
          num: {
            writable: true,
            type: 'number',
            value: 123
          },
          obj: {
            writable: true,
            type: 'object',
            value: obj
          },
          und: {
            writable: true,
            type: 'undefined'
          },
          fn: {
            writable: true,
            type: 'function',
            value: Function
          },
          whatever: {
            writable: true,
            type: 'any', // optional
            value: 555
          }
      });

      // assignment
      wru.assert('str is there', o.str === 'abc');
      wru.assert('bln is there', o.bln === true);
      wru.assert('num is there', o.num === 123);
      wru.assert('obj is there', o.obj === obj);
      wru.assert('und is there', o.und === undefined);
      wru.assert('fn is there', o.fn === Function);
      wru.assert('whatever is there', o.whatever === 555);

      // valid change
      o.str = 'def';
      o.bln = false;
      o.num = 456;
      o.obj = obj = [];
      o.und = undefined;
      o.fn = Object;
      o.whatever = Date;

      wru.assert('str can change', o.str === 'def');
      wru.assert('bln can change', o.bln === false);
      wru.assert('num can change', o.num === 456);
      wru.assert('obj can change', o.obj === obj);
      wru.assert('und can change', o.und === undefined);
      wru.assert('fn can change', o.fn === Object);
      wru.assert('whatever can change any type', o.whatever === Date);

      // invalid change
      try {
        fail(o.str = true);
      } catch(emAll) {
        wru.assert('string OK');
      }
      try {
        fail(o.bln = 'abc');
      } catch(emAll) {
        wru.assert('boolean OK');
      }
      try {
        fail(o.num = 'def');
      } catch(emAll) {
        wru.assert('number OK');
      }
      try {
        fail(o.obj = Function);
      } catch(emAll) {
        wru.assert('object OK');
      }
      try {
        fail(o.und = null);
      } catch(emAll) {
        wru.assert('undefined OK');
      }
      try {
        fail(o.fn = {});
      } catch(emAll) {
        wru.assert('fn OK');
      }
      try {
        o.whatever = {};
        o.whatever = false;
        o.whatever = 'any';
      } catch(o_O) {
        fail('whatever');
      }
    }
  }, {
    name: 'get or set',
    test: function () {
      var o = Object.defineProperties({}, {
        _value: {
          writable: true,
          value: 'default'
        },
        value: {
          type: 'string',
          get: function () {
            return this._value;
          },
          set: function (value) {
            this._value = value;
          }
        }
      });
      wru.assert('getter is OK', o.value === 'default');
      wru.assert('setter is OK too', o.value = 'another string');
      wru.assert('verifying setter', o.value === 'another string');
      try {
        fail(o.value = 123);
      } catch(emAll) {
        wru.assert('the setter guarded as expected ^_^');
      }
      o._value = 123;
      wru.assert('although the property was mutable in this test', o._value === 123);
      try {
        fail(o.value);
      } catch(emAll) {
        wru.assert('the getter does not return anymore what is expected to return');
      }
    }
  }, {
    name: 'methods',
    test: function () {
      var o = Object.defineProperties({}, {
        chain: {
          type: 'function',
          writable: true,
          value: function () {
            return this;
          }
        }
      });
      wru.assert('it returns what is expected', o.chain() === o);
      o.chain = function () {
        return this;
      };
      wru.assert('it keeps returning what is expected', o.chain() === o);
    }
  }, {
    name: 'arguments',
    test: function () {
      var o = Object.defineProperties({}, {
        method: {
          arguments: ['string'],
          value: function () {
            this.arguments = arguments;
          }
        }
      });
      o.method('OK');
      wru.assert('everything went OK', o.arguments[0] === 'OK');
      try {
        fail(o.method(123));
      } catch(emAll) {
        try {
          fail(o.method());
        } catch(emAll) {
          wru.assert('single arg is good');
        }
      }
      o = Object.defineProperties({}, {
        method: {
          arguments: ['string', 'number'],
          value: function () {
            this.arguments = arguments;
          }
        }
      });
      o.method('123', 123);
      wru.assert('string num went OK',
        o.arguments[0] === '123' &&
        o.arguments[1] === 123
      );
      try {
        fail(o.method(123, '123'));
      } catch(emAll) {
        try {
          fail(o.method('123'));
        } catch(emAll) {
          try {
            fail(o.method());
          } catch(emAll) {
            wru.assert('multiple args are good then');
          }
        }
      }
      o = Object.defineProperties({}, {
        method: {
          arguments: [
            ['string', 'number'],
            ['string'],
            ['boolean', 'boolean']
          ],
          value: function () {
            this.arguments = arguments;
          }
        }
      });
      o.method('123', 123);
      wru.assert('string bool went OK',
        o.arguments[0] === '123' &&
        o.arguments[1] === 123
      );
      o.method(false, true);
      wru.assert('bool bool went OK',
        o.arguments[0] === false &&
        o.arguments[1] === true
      );
      o.method('OK');
      wru.assert('string only went OK',
        o.arguments[0] === 'OK'
      );
      try {
        fail(o.method(123, '123'));
      } catch(emAll) {
        try {
          fail(o.method(true));
        } catch(emAll) {
          try {
            fail(o.method());
          } catch(emAll) {
            wru.assert('multiple args groups are good then');
          }
        }
      }
      o = Object.defineProperties({}, {
        method: {
          arguments: [
            [],
            ['number']
          ],
          value: function () {
            this.arguments = arguments;
          }
        }
      });
      o.method(123);
      wru.assert('123 went OK',
        o.arguments[0] === 123
      );
      o.method();
      wru.assert('no args went OK',
        o.arguments.length === 0
      );
      try {
        fail(o.method('123'));
      } catch(emAll) {
        wru.assert('no args successfully implemented');
      }
      o = Object.defineProperties({}, {
        method: {
          arguments: [],
          value: function () {
            this.arguments = arguments;
          }
        }
      });
      o.method();
      wru.assert('no args went OK',
        o.arguments.length === 0
      );
      try {
        fail(o.method(undefined));
      } catch(emAll) {
        wru.assert('no args at all works too');
      }
      o = Object.defineProperties({}, {
        method: {
          arguments: ['number', 'any', 'boolean'],
          value: function () {
            this.arguments = arguments;
          }
        }
      });
      o.method(123, null, false);
      wru.assert('123, null, true went OK',
        o.arguments[0] === 123 &&
        o.arguments[1] === null &&
        o.arguments[2] === false
      );
    }
  }, {
    name: 'returns',
    test: function () {
      var o = Object.defineProperties({}, {
        method: {
          returns: ['string'],
          value: function () {
            return 'OK';
          }
        }
      });
      wru.assert('basis are ok', o.method() === 'OK');
      o = Object.defineProperties({}, {
        method: {
          returns: ['string'],
          value: function () {
            return 123;
          }
        }
      });
      try {
        fail(o.method());
      } catch(emAll) {
        wru.assert('different return type is not allowed');
      }
      o = Object.defineProperties({}, {
        method: {
          returns: ['string', 'number'],
          value: function () {
            return 123;
          }
        }
      });
      wru.assert('multiple returns are OK: number', o.method() === 123);
      o = Object.defineProperties({}, {
        method: {
          returns: ['string', 'number'],
          value: function () {
            return '123';
          }
        }
      });
      wru.assert('multiple returns are OK: string', o.method() === '123');
      o = Object.defineProperties({}, {
        method: {
          arguments: [['number'], ['string'], ['boolean']],
          returns: ['string', 'number'],
          value: function (value) {
            return value;
          }
        }
      });
      wru.assert('multiple returns with arguments',
        o.method('123') === '123' &&
        o.method(123) === 123
      );
      try {
        fail(o.method(true));
      } catch(emAll) {
        wru.assert('arguments accept a value that return does not',
          emAll.message === 'expected string,number returned true');
      }
    }
  }, {
    name: 'inheritance',
    test: function () {
      var
        Class = function () {},
        o = Object.defineProperties({}, {
          instance: {
            writable: true,
            type: Class
          }
        })
      ;
      o.instance = new Class;
      wru.assert('Class is fine', o.instance instanceof Class);
      try {
        fail(o.instance = {});
      } catch(emAll) {
        wru.assert('yep, only instanceof Class are allowed');
      }
      o = Object.defineProperties({}, {
        instance: {
          writable: true,
          type: Class.prototype
        }
      });
      o.instance = new Class;
      wru.assert('Class.prototype is fine too', o.instance instanceof Class);
      try {
        fail(o.instance = {});
      } catch(emAll) {
        wru.assert('yep, only if Class.prototype.isPrototypeOf(obj) passes');
      }
    }
  }, {
    name: 'classes',
    test: function () {

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
      wru.assert('toString works', ('' + me) === 'Mr Andrea');

    }
  }, {
    name: 'method as typed property',
    test: function () {
      function reassigned(value) {
        wru.assert('still the right context', this === o);
        return value;
      }
      var o = Object.create(null, {
        method: {
          writable: true,
          type: 'function',
          // once you decide to guard arguments and returns
          arguments: [['string'], ['number'], ['boolean']],
          // you do this for any lazily changed function
          returns: ['string', 'number'],
          // useful for handleEvent or any other callback
          // that might be swapped at runtime
          // preserving strict behavior ^_^
          value: function (value) {
            wru.assert('right context', this === o);
            return value;
          }
        }
      });
      wru.assert('method correctly implemented', o.method(1) === 1);
      try {
        fail(o.method({}));
      } catch(emAll) {
        wru.assert('arguments guarded',
          emAll.message === 'expected string,number,boolean received [object Object]');
      }
      try {
        fail(o.method(true));
      } catch(emAll) {
        wru.assert('return guarded',
          emAll.message === 'expected string,number returned true');
      }
      o.method = reassigned;
      wru.assert('method working as expected', o.method(1) === 1);
      try {
        fail(o.method({}));
      } catch(emAll) {
        wru.assert('reassigned: arguments guarded',
          emAll.message === 'expected string,number,boolean received [object Object]');
      }
      try {
        fail(o.method(true));
      } catch(emAll) {
        wru.assert('reassigned: return guarded',
          emAll.message === 'expected string,number returned true');
      }
    }
  }, {
    name: 'null',
    test: function () {
      var o = Object.create(null, {
        value: {
          type: 'object',
          value: null
        }
      });
      wru.assert(o.value === null);
    }
  }
]);

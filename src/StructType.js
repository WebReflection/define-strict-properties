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
(function(global){
  if ('StructType' in global) return;
  var hasOwnProperty = {}.hasOwnProperty;
  function describe(properties) {
    var descriptors = {}, key;
    for (key in properties) {
      if (hasOwnProperty.call(properties, key)) {
        descriptors[key] = {
          type: properties[key],
          configurable: false,
          enumerable: true,
          writable: true
        };
      }
    }
    return descriptors;
  }

  // numeric types
  global.uint8 =
  global.uint8Clamped =
  global.uint16 =
  global.uint32 =
  global.int8 =
  global.int16 =
  global.int32 =
  global.float32 =
  global.float64 = 'number';

  // other types
  global['boolean'] = 'boolean';
  global['string'] = 'string';
  global['object'] = 'object';
  global.Any = 'any';

  global.StructType = function StructType(proto) {
    var descriptors = describe(proto);
    return function (defaults) {
      var typed = Object.create(null, descriptors), key;
      for (key in defaults) {
        if (hasOwnProperty.call(defaults, key)) {
          typed[key] = defaults[key];
        }
      }
      return Object.preventExtensions(typed);
    };
  };
}(typeof window === 'undefined' ? global : window));
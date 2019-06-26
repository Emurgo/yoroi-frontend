/* eslint-disable */

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf#Appending_Prototype_Chains

/**
*** appendChain(@object, @prototype)
*
* Appends the first non-native prototype of a chain to a new prototype.
* Returns @object (if it was a primitive value it will transformed into an object).
*
*** appendChain(@object [, "@arg_name_1", "@arg_name_2", "@arg_name_3", "..."], "@function_body")
*** appendChain(@object [, "@arg_name_1, @arg_name_2, @arg_name_3, ..."], "@function_body")
*
* Appends the first non-native prototype of a chain to the native Function.prototype object, then appends a
* new Function(["@arg"(s)], "@function_body") to that chain.
* Returns the function.
*
**/

export const appendChain = function(oChain, oProto) {
  if (arguments.length < 2) { 
    throw new TypeError('Object.appendChain - Not enough arguments');
  }
  if (typeof oProto !== 'object' && typeof oProto !== 'string') {
    throw new TypeError('second argument to Object.appendChain must be an object or a string');
  }

  var oNewProto = oProto,
      oReturn = o2nd = oLast = oChain instanceof Object ? oChain : new oChain.constructor(oChain);

  for (var o1st = Object.getPrototypeOf(o2nd);
    o1st !== Object.prototype && o1st !== Function.prototype;
    o1st = Object.getPrototypeOf(o2nd)
  ) {
    o2nd = o1st;
  }

  if (oProto.constructor === String) {
    oNewProto = Function.prototype;
    oReturn = Function.apply(null, Array.prototype.slice.call(arguments, 1));
    Object.setPrototypeOf(oReturn, oLast);
  }

  Object.setPrototypeOf(o2nd, oNewProto);
  return oReturn;
}
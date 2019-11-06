// @flow

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf#Appending_Prototype_Chains

/**
 * appendChain(@object, @prototype)
 *
 * Appends the first non-native prototype of a chain to a new prototype.
 * Returns @object with prototype added
 *
*/
export const appendChain = function (oChain: Object, oProto: Object): Object {
  // assume the first non-native prototype is the object itself
  let o2nd = oChain;

  // search for the first native prototype of a chain
  for (
    let o1st = Object.getPrototypeOf(o2nd);
    _isNonNative(o1st);
    o1st = Object.getPrototypeOf(o2nd)
  ) {
    o2nd = o1st;
  }

  Object.setPrototypeOf(o2nd, oProto);
  return oChain;
};

const _isNonNative = (obj: any) => {
  // $FlowFixMe flow doesn't like prototype
  return obj !== Object.prototype && obj !== Function.prototype;
};

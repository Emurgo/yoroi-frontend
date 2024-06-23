// @flow
import { useEffect, useState } from 'react';

/**
 * Similar to `useMemo` hook but allows async functions.
 * The result of the producer function will be sent straight into a React state updater,
 * so it can be either a new value directly or an updater function that accepts the previous state.
 *
 * @param create - the async producer function, returns a promise of: either the new version of the value or an updater function
 * @param inputs - effect inputs to react to
 * @param defaultValue - the value which will be returned until the async resolves
 * @return {T} - returns the supplied default value until the producer function resolves and then returns whatever it has done to the state
 */
export function useAsyncMemo<T>(create: () => Promise<T | (T => T)>, inputs: any, defaultValue: T): T {
  const [res, setRes] = useState<T>(defaultValue);
  useEffect(() => {
    create().then(res => {
      if (res === useAsyncMemo.void) {
        // ignore the void return
        // just a tiny optimisation
      } else {
        // update the state
        setRes(res);
      }
      return null;
    });
  }, inputs)
  return res;
}

/**
 * The value that can be returned when the result of the async producer function in the `useAsyncMemo` should not change the existing value.
 *
 * This is just an identity function which means the existing React state will be preserved.
 */
useAsyncMemo.void = <T>(x: T): T => x;
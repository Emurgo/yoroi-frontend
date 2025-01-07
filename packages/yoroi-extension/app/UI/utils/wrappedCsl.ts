import { WasmModuleProxy } from '@emurgo/cross-csl-core';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
/* eslint-disable @typescript-eslint/no-explicit-any */

// const cardano = RustModule.CrossCsl.init('any');

type CslPointer = { ptr: number; free: () => void };

export const wrappedCsl = (): { csl: WasmModuleProxy; release: VoidFunction } => {
  let pointers: CslPointer[] = [];
  const track = (p: CslPointer) => pointers.push(p);
  const release = () => {
    pointers.forEach(p => {
      if (p?.ptr !== 0) {
        try {
          p.free();
        } catch (e) {
          //
        }
      }
    });
    pointers = [];
  };

  const trackIfNeeded = <T>(obj: T): T => {
    if (typeof (obj as any)?.free === 'function') track(obj as any);
    if (obj instanceof Promise) {
      return obj.then(result => trackIfNeeded(result)) as any;
    }
    if (Array.isArray(obj)) return obj.map(o => trackIfNeeded(o) as any) as any;
    return obj;
  };

  const proxy = new Proxy(RustModule.CrossCsl.init('any'), {
    get(target: WasmModuleProxy, p: string | symbol, receiver: any): any {
      const prop = Reflect.get(target, p, receiver);
      if (!isClass(prop)) {
        return prop;
      }

      return new Proxy(prop, {
        get: (target: any, name: string) => {
          if (name === 'prototype') return target[name];
          const isFunc = typeof target[name] === 'function';
          if (!isFunc) return target[name];
          return (...args: any[]) => {
            const result = target[name](...args);
            return trackIfNeeded(result);
          };
        },
      });
    },
  });

  return { csl: proxy, release };
};

const isClass = (func: any) => {
  return typeof func === 'function' && (/^\s*class\s+/.test(func.toString()) || func.name[0] === func.name[0].toUpperCase());
};

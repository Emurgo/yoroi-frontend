import {
  bytesToHex,
  delay,
  hexToBytes,
  iterateLenGet,
  iterateLenGetMap,
  timeCached,
  zipGenerators
} from './coreUtils';
import type { LenGet, LenGetMap } from './coreUtils';
import { RustModule } from './api/ada/lib/cardanoCrypto/rustLoader';

describe('timeCached', () => {

  test('ttl = 0 | no caching', () => {

    const callCounter = [0];

    const cachedIncrement = timeCached(() => {
      return ++callCounter[0];
    }, 0);

    expect(cachedIncrement()).toEqual(1);
    expect(cachedIncrement()).toEqual(2);
    expect(cachedIncrement()).toEqual(3);
    expect(cachedIncrement()).toEqual(4);
    expect(cachedIncrement()).toEqual(5);
  });

  test('ttl < 0 | infinite caching', async () => {

    const callCounter = [0];

    const cachedIncrement = timeCached(() => {
      return ++callCounter[0];
    }, -1);

    expect(cachedIncrement()).toEqual(1);
    expect(cachedIncrement()).toEqual(1);

    await delay(3_000);

    expect(cachedIncrement()).toEqual(1);
    expect(cachedIncrement()).toEqual(1);
  });

  test('ttl > 0 | temporary caching', async () => {

    const callCounter = [0];

    const cachedIncrement = timeCached(() => {
      return ++callCounter[0];
    }, 2_000);

    expect(cachedIncrement()).toEqual(1);
    expect(cachedIncrement()).toEqual(1);

    await delay(3_000);

    expect(cachedIncrement()).toEqual(2);
    expect(cachedIncrement()).toEqual(2);
  });

  test('async ttl > 0 | temporary async caching', async (done) => {

    const callCounter = [0];

    const cachedIncrement = timeCached(async () => {
      await delay(100);
      return ++callCounter[0];
    }, 2_000);

    expect(await cachedIncrement()).toEqual(1);
    expect(await cachedIncrement()).toEqual(1);

    await delay(2_000);

    expect(await cachedIncrement()).toEqual(2);
    expect(await cachedIncrement()).toEqual(2);

    done();
  });

});

function createLenget<T>(...items: Array<T>): LenGet<T> {
  return { len: () => items.length, get: i => items[i] };
}

function createLengetMap<K,V>(items: { [K]: V }): LenGetMap<K,V> {
  return { keys: () => createLenget(...Object.keys(items)), get: k => items[k] };
}

describe('generators', () => {

  function createAssetNames(...hexes: Array<string>): RustModule.WalletV4.AssetNames {
    const names = RustModule.WalletV4.AssetNames.new();
    for (const hex of hexes) {
      names.add(RustModule.WalletV4.AssetName.new(hexToBytes(hex)));
    }
    return names;
  }

  function createAssets(items: { [string]: number }): RustModule.WalletV4.Assets {
    const assets = RustModule.WalletV4.Assets.new();
    for (const [hex, amount] of Object.entries(items)) {
      assets.insert(
        RustModule.WalletV4.AssetName.new(hexToBytes(hex)),
        RustModule.WalletV4.BigNum.from_str(String(amount)),
      );
    }
    return assets;
  }

  test('iterateLenGet', () => {
    const lenget = createLenget('a', 'b', 'c');
    const iter = iterateLenGet(lenget)[Symbol.iterator]();
    expect(iter.next().value).toEqual('a');
    expect(iter.next().value).toEqual('b');
    expect(iter.next().value).toEqual('c');
    expect(iter.next().done).toEqual(true);
    expect(iter.next().value).toEqual(undefined);
  });

  test('iterateLenGet collecting', () => {
    const lenget = createLenget('a', 'b', 'c', 'd');
    const iter = iterateLenGet(lenget);
    expect([...iter]).toEqual(['a', 'b', 'c', 'd']);
  });

  test('iterateLenGet for-of', () => {
    const arr = ['a', 'b', 'c', 'd'];
    const lenget = createLenget(...arr);
    let counter = 0;
    for (const item of iterateLenGet(lenget)) {
      expect(item).toEqual(arr[counter++]);
    }
  });

  test('iterateLenGet wasm', async (done) => {
    await RustModule.load();

    const names: RustModule.WalletV4.AssetNames =
      createAssetNames('cafebabe', '1234567890', 'aabbccddeeff');

    const iter = iterateLenGet(names)[Symbol.iterator]();
    expect(iter.next().value.to_hex()).toEqual(names.get(0).to_hex());
    expect(iter.next().value.to_hex()).toEqual(names.get(1).to_hex());
    expect(iter.next().value.to_hex()).toEqual(names.get(2).to_hex());
    expect(iter.next().done).toEqual(true);
    expect(iter.next().value).toEqual(undefined);

    done();
  });

  test('iterateLenGet with null', () => {
    const iter = iterateLenGet(null)[Symbol.iterator]();
    expect(iter.next().done).toEqual(true);
    expect(iter.next().value).toEqual(undefined);
  });

  test('iterateLenGetMap', () => {
    const lengetMap = createLengetMap({ a: 10, b: 20, c: 30 });
    const iter = iterateLenGetMap(lengetMap)[Symbol.iterator]();
    expect(iter.next().value).toEqual(['a', 10]);
    expect(iter.next().value).toEqual(['b', 20]);
    expect(iter.next().value).toEqual(['c', 30]);
    expect(iter.next().done).toEqual(true);
    expect(iter.next().value).toEqual(undefined);
  });

  test('iterateLenGetMap wasm', async (done) => {

    await RustModule.load();

    const assets: RustModule.WalletV4.Assets =
      createAssets({ 'cafebabe': 123, '1234567890': 456, 'aabbccddeeff': 789 });

    const iter = iterateLenGetMap(assets)[Symbol.iterator]();

    function checkEntry(
      entry: [RustModule.WalletV4.AssetName, RustModule.WalletV4.BigNum],
      hex: string,
      amount: number,
    ) {
      expect(bytesToHex(entry[0].name())).toEqual(hex);
      expect(Number(entry[1]?.to_str())).toEqual(amount);
    }

    checkEntry(iter.next().value, 'cafebabe', 123);
    checkEntry(iter.next().value, '1234567890', 456);
    checkEntry(iter.next().value, 'aabbccddeeff', 789);

    expect(iter.next().done).toEqual(true);
    expect(iter.next().value).toEqual(undefined);

    done();
  });

  test('iterateLenGetMap with null', () => {
    const iter = iterateLenGetMap(null)[Symbol.iterator]();
    expect(iter.next().done).toEqual(true);
    expect(iter.next().value).toEqual(undefined);
  });

  test('zipGenerators same len', () => {
    const iter = zipGenerators([1, 2, 3, 4], [5, 6, 7, 8])[Symbol.iterator]();
    expect(iter.next().value).toEqual([1, 5]);
    expect(iter.next().value).toEqual([2, 6]);
    expect(iter.next().value).toEqual([3, 7]);
    expect(iter.next().value).toEqual([4, 8]);
    expect(iter.next().done).toEqual(true);
    expect(iter.next().value).toEqual(undefined);
  });

  test('zipGenerators longer left', () => {
    const iter = zipGenerators([1, 2, 3, 4, 5, 6], [5, 6, 7, 8])[Symbol.iterator]();
    expect(iter.next().value).toEqual([1, 5]);
    expect(iter.next().value).toEqual([2, 6]);
    expect(iter.next().value).toEqual([3, 7]);
    expect(iter.next().value).toEqual([4, 8]);
    expect(iter.next().done).toEqual(true);
    expect(iter.next().value).toEqual(undefined);
  });

  test('zipGenerators longer right', () => {
    const iter = zipGenerators([1, 2, 3, 4], [5, 6, 7, 8, 9, 10])[Symbol.iterator]();
    expect(iter.next().value).toEqual([1, 5]);
    expect(iter.next().value).toEqual([2, 6]);
    expect(iter.next().value).toEqual([3, 7]);
    expect(iter.next().value).toEqual([4, 8]);
    expect(iter.next().done).toEqual(true);
    expect(iter.next().value).toEqual(undefined);
  });

  test('zipGenerators with generators', () => {
    const someLenGetCollection1 = createLenget(11, 22, 33, 44);
    const someLenGetCollection2 = createLenget(55, 66, 77, 88);
    const iter = zipGenerators(
      iterateLenGet(someLenGetCollection1),
      iterateLenGet(someLenGetCollection2),
    )[Symbol.iterator]();
    expect(iter.next().value).toEqual([11, 55]);
    expect(iter.next().value).toEqual([22, 66]);
    expect(iter.next().value).toEqual([33, 77]);
    expect(iter.next().value).toEqual([44, 88]);
    expect(iter.next().done).toEqual(true);
    expect(iter.next().value).toEqual(undefined);
  });
});

describe('ExtendedIterable', () => {
  test('zip', () => {
    const it = iterateLenGet(createLenget(1, 2, 3, 4, 5));
    const zipped = it.zip([10, 20, 30, 40, 50, 60]);
    expect(zipped.toArray()).toEqual([[1, 10], [2, 20], [3, 30], [4, 40], [5, 50]])
  });
  test('forEach', () => {
    const it = iterateLenGet(createLenget(1, 2, 3, 4, 5));
    const res = [];
    it.forEach(x => res.push(x * x));
    expect(res).toEqual([1, 4, 9, 16, 25])
  });
  test('map', () => {
    const it = iterateLenGet(createLenget(1, 2, 3, 4, 5));
    const zipped = it.map(x => x * x);
    expect(zipped.toArray()).toEqual([1, 4, 9, 16, 25])
  });
  test('unique', () => {
    const it = iterateLenGet(createLenget(1, 1, null, 2, 2, 3, 3, 3, 'a', 'b', 'a', true, null, false, true, 'b', 2));
    const unique = it.unique();
    expect(unique.toArray()).toEqual([1, null, 2, 3, 'a', 'b', true, false])
  });
  test('nonNull', () => {
    const it = iterateLenGet(createLenget(1, null, 2, undefined, 'a', null, 'b', undefined, false));
    const unique = it.nonNull();
    expect(unique.toArray()).toEqual([1, 2, 'a', 'b', false])
  });
  test('filter', () => {
    const it = iterateLenGet(createLenget(1, null, 2, undefined, 'a', null, 'b', undefined, false));
    const unique = it.filter(t => t == null);
    expect(unique.toArray()).toEqual([null, undefined, null, undefined])
  });
  test('keys', () => {
    const it = iterateLenGetMap(createLengetMap({ a: 1, b: 2, c: 3 }));
    expect(it.keys().toArray()).toEqual(['a', 'b', 'c']);
  });
  test('values', () => {
    const it = iterateLenGetMap(createLengetMap({ a: 1, b: 2, c: 3 }));
    expect(it.values().toArray()).toEqual([1, 2, 3]);
  });
});

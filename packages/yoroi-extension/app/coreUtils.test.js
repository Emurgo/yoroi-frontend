import { delay, timeCached } from './coreUtils';

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

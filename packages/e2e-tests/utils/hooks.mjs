import driversPoolsManager from './driversPool.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { DRIVERS_AMOUNT } from '../helpers/constants.js';

export const mochaHooks = {
  async beforeAll() {
    let attempts = 0;
    const maxAttempts = 3;
    let waitTimeout = oneMinute;

    while (attempts < maxAttempts) {
      try {
        this.timeout(waitTimeout);
        driversPoolsManager.createPoolOfDrivers(DRIVERS_AMOUNT);
        await driversPoolsManager.prepareExtensions();
        this.timeout(oneMinute);
        break;
      } catch (error) {
        if (error.message.includes('Timeout') && attempts < maxAttempts - 1) {
          console.warn(
            `[beforeAll] Creating driver error (attempt ${attempts + 1}):`,
            error.message
          );
          const sleepPromise = new Promise(resolve => setTimeout(resolve, retryDelay));
          sleepPromise.then(() => console.log('[beforeAll] Waited for 2 seconds'));
          attempts++;
          waitTimeout = waitTimeout + oneMinute;
        } else {
          console.error('[beforeAll] No success to create a new driver:', error);
          throw error;
        }
      }
    }
  },
  async beforeEach(done) {
    // Check for nested descibe sections in case if any tests failed in a main describe
    const grandParent = this.currentTest.parent.parent;
    if (grandParent?.tests.some(test => test.state === 'failed')) {
      this.skip();
    }
    // Skip subsequent tests if the describe block failed
    if (this.currentTest.parent.tests.some(test => test.state === 'failed')) {
      this.skip();
    }
    done();
  },
  async afterAll() {
    await driversPoolsManager.closeAllUnused();
  },
};

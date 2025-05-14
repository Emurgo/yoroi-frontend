import driversPoolsManager from './driversPool.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { DRIVERS_AMOUNT } from '../helpers/constants.js';

export const mochaHooks = {
  async beforeAll() {
    this.timeout(oneMinute);
    driversPoolsManager.createPoolOfDrivers(DRIVERS_AMOUNT);
    await driversPoolsManager.prepareExtensions();
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
  afterAll(done) {
    driversPoolsManager.closeAllUnused();
    done();
  },
};

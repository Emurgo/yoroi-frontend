import driversPoolsManager from './driversPool.js';
import { defaultWaitTimeout } from '../helpers/timeConstants.js';

export const mochaHooks = {
  beforeAll(done) {
    this.timeout(defaultWaitTimeout);
    driversPoolsManager.createPoolOfDrivers(2);
    driversPoolsManager.prepareExtensions();
    done();
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

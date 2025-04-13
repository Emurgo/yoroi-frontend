import { sleep } from '../utils/utils.js';
import { hostname } from 'os';

class LedgerEmulatorControllerError extends Error {}

export const LedgerStates = Object.freeze({
  cardanoIsReady: 'Cardano is ready',
  confirmAddress: 'Confirm address?',
});

export class LedgerEmulatorController {
  constructor(logger) {
    this.logger = logger;
    this.speculosEndpoint = `http://${hostname()}:5001`;
    this.logger.info(`LedgerEmulator::constructor speculos endpoint: ${this.speculosEndpoint}`);
  }

  async _click(button) {
    this.logger.info(`LedgerEmulator::_click is called. Button: ${button}`);
    await fetch(`${this.speculosEndpoint}/button/${button}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{"action":"press-and-release"}',
    });
  }

  async clickBoth() {
    await this._click('both');
  }

  async clickLeft() {
    await this._click('left');
  }

  async clickRight() {
    await this._click('right');
  }

  /**
   * The function reads a text from the current ledger screen
   * @returns {Promise<string>}
   */
  async readScreen() {
    this.logger.info(`LedgerEmulator::readScreen is called`);
    try {
      const eventsResponse = await fetch(`${this.speculosEndpoint}/events?currentscreenonly=true`);
      if (!eventsResponse.ok) {
        this.logger.error(
          `LedgerEmulator::readScreen Not able to receive events for the current screen`
        );
        throw new LedgerEmulatorControllerError(
          'Not able to receive events for the current screen'
        );
      }
      const eventsObj = await eventsResponse.json();
      const eventsText = eventsObj.events.map(evt => evt.text).join(' ');
      this.logger.info(`LedgerEmulator::readScreen The current screen text: "${eventsText}"`);

      return eventsText;
    } catch (error) {
      console.error(error);
      this.logger.error(`LedgerEmulator::readScreen error`);
      this.logger.error(JSON.stringify(error, null, 2));
      throw new LedgerEmulatorControllerError('Some error happen: ', error);
    }
  }

  async isReadyForAction(timeoutMilliSec, repeatPeriodMilliSec) {
    this.logger.info(`LedgerEmulator::isReadyForSigning is called`);
    const endTime = Date.now() + timeoutMilliSec;
    while (Date.now() < endTime) {
      const currentText = await this.readScreen();
      if (currentText !== LedgerStates.cardanoIsReady) {
        this.logger.info(`LedgerEmulator::isReadyForSigning Ledger is ready.`);
        return true;
      }
      this.logger.info(
        `LedgerEmulator::isReadyForSigning Ledger is not ready. Waiting for ${repeatPeriodMilliSec} ms`
      );
      await sleep(repeatPeriodMilliSec);
    }
    return false;
  }

  async fullConfirmAndGetContent() {
    this.logger.info(`LedgerEmulator::fullConfirmAndGetContent is called`);
    const result = [];
    let content = await this.readScreen();
    while (!Object.values(LedgerStates).includes(content)) {
      const multiScreenDataRegExp = /\(\d\/\d\)/;
      if (multiScreenDataRegExp.test(content)) {
        const dataCounter = content.match(multiScreenDataRegExp)[0];
        const counterNumbers = dataCounter.split('/');
        const firstNumber = Number(counterNumbers[0][1]);
        const secondNumber = Number(counterNumbers[1][0]);
        const multiScreenDataContent = [];
        for (let index = firstNumber; index <= secondNumber; index++) {
          const currentScreen = await this.readScreen();
          const contentWithoutTitle = currentScreen.substring(currentScreen.indexOf(')') + 1);
          multiScreenDataContent.push(contentWithoutTitle);
          await this.clickRight();
        }
        result.push(multiScreenDataContent.join(''));
      } else {
        result.push(content);
      }
      await this.clickBoth();
      content = await this.readScreen();
    }
    await this.clickBoth();

    return result;
  }
}

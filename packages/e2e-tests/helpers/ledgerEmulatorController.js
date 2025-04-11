import { sleep } from '../utils/utils.js';

const SPECULOS_ENDPOINT = 'http://localhost:5001';

class LedgerEmulatorControllerError extends Error {}

export const CARDANO_IS_READY = 'Cardano is ready';

export class LedgerEmulatorController {
  constructor(logger) {
    this.logger = logger;
  }

  async _click(button) {
    this.logger.info(`LedgerEmulator::_click is called. Button: ${button}`);
    await fetch(`${SPECULOS_ENDPOINT}/button/${button}`, {
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
   * @returns {string}
   */
  async readScreen() {
    this.logger.info(`LedgerEmulator::readScreen is called`);
    try {
      const eventsResponse = await fetch(`${SPECULOS_ENDPOINT}/events?currentscreenonly=true`);
      if (!eventsResponse.ok) {
        throw new LedgerEmulatorController('Not able to receive events for the current screen');
      }
      const eventsObj = await eventsResponse.json();
      const eventsText = eventsObj.events.map(evt => evt.text).join(' ');
      this.logger.info(`LedgerEmulator::readScreen The current screen text: "${eventsText}"`);

      return eventsText;
    } catch (error) {
      console.error(error);
      throw new LedgerEmulatorController('Some error happen: ', error);
    }
  }

  async isReadyForAction(timeoutMilliSec, repeatPeriodMilliSec) {
    this.logger.info(`LedgerEmulator::isReadyForSigning is called`);
    const endTime = Date.now() + timeoutMilliSec;
    while (Date.now() < endTime) {
      const currentText = await this.readScreen();
      if (currentText !== CARDANO_IS_READY) {
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
}

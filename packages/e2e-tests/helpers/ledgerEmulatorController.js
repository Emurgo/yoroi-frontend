import { sleep } from '../utils/utils.js';
import { networkInterfaces } from 'os';
import { LedgerModels } from './ledgerHelper.js';
import { quarterSecond, threeSeconds } from './timeConstants.js';

class LedgerEmulatorControllerError extends Error {}

export const LedgerStates = Object.freeze({
  cardanoIsReady: 'Cardano is ready',
  confirmAddress: 'Confirm address?',
  confirmExport: 'Confirm export 2 public keys?'
});

export class LedgerEmulatorController {
  constructor(logger, model) {
    this.logger = logger;
    this.model = model;
    this.speculosEndpoint = `http://${networkInterfaces().eth0[0].address}:5001`;
    this.logger.info(`LedgerEmulator::constructor speculos endpoint: ${this.speculosEndpoint}`);
  }

  isLedgerS = () => this.model === LedgerModels.NanoS;
  isLedgerSPlus = () => this.model === LedgerModels.NanoSPlus;
  isLedgerX = () => this.model === LedgerModels.NanoX;

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

  async confirm() {
    if (this.isLedgerS()) {
      await this.clickRight();
    } else {
      await this.clickBoth();
    }
  }

  /**
   * The function joins the screen title and the screen message
   * @param {{screenTitle: string, screenText: string}} screenMsg 
   * @returns {string}
   */
  _joinMsg = (screenMsg) => screenMsg.screenTitle + ' ' + screenMsg.screenText

  /**
   * The function reads a text from the current ledger screen
   * @returns {Promise<{screenTitle: string, screenText: string}>}
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
      this.logger.info(`LedgerEmulator::readScreen The raw response:\n${JSON.stringify(eventsObj, null, 2)}`);
      if (eventsObj.events.length === 0) {
        return {screenTitle: '', screenText: ''};
      }
      const screenTitle = eventsObj.events[0].text;
      const remaingPart = eventsObj.events.splice(1);
      const screenText = remaingPart.map(evt => evt.text).join('');
      const result = {screenTitle, screenText};
      this.logger.info(`LedgerEmulator::readScreen The current screen text:\n${JSON.stringify(result, null, 2)}`);

      return result;
    } catch (error) {
      console.error(error);
      this.logger.error(`LedgerEmulator::readScreen error`);
      this.logger.error(JSON.stringify(error, null, 2));
      throw new LedgerEmulatorControllerError('Some error happen: ', error);
    }
  }

  async confirmExportPubKeys() {
    this.logger.info(`LedgerEmulator::confirmExportPubKeys is called`);
    const endTime = Date.now() + threeSeconds;
    let success = false;
    while (Date.now() < endTime) {
      const curScreen = await this.readScreen();
      if (this._joinMsg(curScreen) === LedgerStates.confirmExport) {
        this.logger.info(`LedgerEmulator::confirmExportPubKeys Ledger is ready for export.`);
        await this.confirm();
        success = true;
        break;
      }
      this.logger.info(
        `LedgerEmulator::confirmExportPubKeys Ledger is not ready for export. Waiting for ${quarterSecond} ms`
      );
      await sleep(quarterSecond);
    }
    if (!success){
      throw new LedgerEmulatorControllerError('Emulator is not ready for export');
    }
  }

  async cardanoIsReady(timeoutMilliSec, repeatPeriodMilliSec) {
    this.logger.info(`LedgerEmulator::isReadyForSigning is called`);
    const endTime = Date.now() + timeoutMilliSec;
    while (Date.now() < endTime) {
      const curScreen = await this.readScreen();
      if (this._joinMsg(curScreen) === LedgerStates.cardanoIsReady) {
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

  async isReadyForAction(timeoutMilliSec, repeatPeriodMilliSec) {
    this.logger.info(`LedgerEmulator::isReadyForSigning is called`);
    const endTime = Date.now() + timeoutMilliSec;
    while (Date.now() < endTime) {
      const curScreen = await this.readScreen();
      if (this._joinMsg(curScreen) !== LedgerStates.cardanoIsReady) {
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

  async fullConfAndContentNanoXAndSPlus() {
    this.logger.info(`LedgerEmulator::fullConfAndContentNanoXAndSPlus is called`);
    const result = [];
    let content = await this.readScreen();
    while (!Object.values(LedgerStates).includes(this._joinMsg(content))) {
      const multiScreenDataRegExp = /\(\d\/\d\)/;
      if (multiScreenDataRegExp.test(content.screenTitle)) {
        const dataCounter = content.screenTitle.match(multiScreenDataRegExp)[0];
        const counterNumbers = dataCounter.split('/');
        const firstNumber = Number(counterNumbers[0][1]);
        const secondNumber = Number(counterNumbers[1][0]);
        const multiScreenDataContent = [];
        for (let index = firstNumber; index <= secondNumber; index++) {
          const currentScreen = await this.readScreen();
          multiScreenDataContent.push(currentScreen.screenText);
          await this.clickRight();
        }
        result.push(multiScreenDataContent.join(''));
      } else {
        result.push(content.screenText);
      }
      await this.clickBoth();
      content = await this.readScreen();
    }
    await this.clickBoth();
    this.logger.info(`LedgerEmulator::fullConfAndContentNanoXAndSPlus result: ${JSON.stringify(result, null, 2)}`);

    return result;
  }

  async fullConfAndContentNanoS() {
    this.logger.info(`LedgerEmulator::fullConfirmAndGetContentNanoS is called`);
    const result = [];
    let content = await this.readScreen();
    while (!Object.values(LedgerStates).includes(this._joinMsg(content))) {
      let clickCounter = 0;
      let screenFullText = content.screenText;
      while (true) {
        let prevText = (await this.readScreen()).screenText;
        clickCounter++;
        await this.clickRight();
        const shiftedText = (await this.readScreen()).screenText;
        if (prevText === shiftedText) {
          if (clickCounter === 1) {
            clickCounter = 0;
            result.push(shiftedText);
            await this.clickBoth();
            content = await this.readScreen();
          } else {
            for (let index = clickCounter; index > 0; index--) {
              await this.clickLeft();
            }
            clickCounter = 0;
            result.push(screenFullText);
            await this.clickBoth();
            content = await this.readScreen();
          }
          break;
        } else {
          screenFullText = screenFullText + shiftedText[shiftedText.length - 1]
          continue;
        }
      }
      content = await this.readScreen();
    }
    await this.clickRight();

    this.logger.info(`LedgerEmulator::fullConfirmAndGetContentNanoS result: ${JSON.stringify(result, null, 2)}`);
    return result;
  }

  async fullConfirmAndGetContent() {
    this.logger.info(`LedgerEmulator::fullConfirmAndGetContent is called`);
    if (this.isLedgerS()) {
      return this.fullConfAndContentNanoS();
    }
    return this.fullConfAndContentNanoXAndSPlus();
  }
}

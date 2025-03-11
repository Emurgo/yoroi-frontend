const SPECULOS_ENDPOINT = 'http://localhost:5001';

class LedgerEmulatorControllerError extends Error {}

export class LedgerEmulatorController {
  constructor(logger) {
    this.logger = logger;
  }

  async _click(button) {
    await fetch(
      `${SPECULOS_ENDPOINT}/button/${button}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{"action":"press-and-release"}',
      }
    );
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

  // todo
  async readScreen() {
    try {
      const eventsResponse = await fetch(
        `${SPECULOS_ENDPOINT}/events?currentscreenonly=true`
      );
      if (!eventsResponse.ok) {
        throw new LedgerEmulatorController('Not able to receive events for the current screen');
      }
      const eventsObj = await eventsResponse.json();
      const eventsText = eventsObj.events.map(evt => evt.text).join(' ');

      return eventsText;
    } catch (error) {
      console.error(error);
      throw new LedgerEmulatorController('Some error happen: ', error);
    }
  }
}

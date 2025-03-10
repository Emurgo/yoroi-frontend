const SPECULOS_ENDPOINT = 'http://localhost:5001';

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
    // POST to http://localhost:5000/apdu
    // '{"apduHex":"d700000000"}'
    // and receive from http://localhost:5000/events?stream=true
    // 'data: {"text": "...screen text...", "x": 42, "y": 42, "w": 45, "h": 13, "clear": false}'
  }
}

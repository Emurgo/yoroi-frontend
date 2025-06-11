// adapted from https://github.com/LedgerHQ/ledger-live/blob/develop/libs/ledgerjs/packages/hw-transport-http/src/HttpTransport.ts

import Transport from "@ledgerhq/hw-transport";
import { TransportError } from "@ledgerhq/errors";

const SPECULOS_ENDPOINT = 'http://localhost:5001/apdu';
/**
 * HTTP transport implementation
 */

export default class HttpTransport extends Transport {
  static isSupported = (): Promise<boolean> => Promise.resolve(typeof fetch === "function");
  // this transport is not discoverable
  static list = (): any => Promise.resolve([]);
  static listen = (_observer: any) => ({
    unsubscribe: () => {},
  });
  static check = async (url: string, timeout = 5000) => {
    const response = await fetch(url, {
      signal: makeTimeoutAbortSignal(timeout),
    });

    if (response.status !== 200) {
      throw new TransportError(
        "failed to access HttpTransport(" + url + "): status " + response.status,
        "HttpTransportNotAccessible",
      );
    }
  };

  static async open(url: string, timeout?: number): Promise<Transport> {
    await HttpTransport.check(url, timeout);
    return new HttpTransport(url);
  }


  static async create(): Promise<Transport> {
    return new HttpTransport(SPECULOS_ENDPOINT);
  }

  url: string;

  constructor(url: string) {
    super();
    this.url = url;
  }

  async exchange(apdu: Buffer): Promise<Buffer> {
    const apduHex = apdu.toString("hex");
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: apduHex,
      }),
    });

    if (response.status !== 200) {
      throw new TransportError(
        "failed to communicate to server. code=" + response.status,
        "HttpTransportStatus" + response.status,
      );
    }

    const responseText = await response.text();
    const data = JSON.parse(responseText);
    return Buffer.from(data.data, "hex");
  }

  setScrambleKey() {}

  close(): Promise<void> {
    return Promise.resolve();
  }
}

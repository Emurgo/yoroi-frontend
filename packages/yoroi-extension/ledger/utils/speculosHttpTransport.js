// adapted from https://github.com/LedgerHQ/ledger-live/blob/develop/libs/ledgerjs/packages/hw-transport-http/src/HttpTransport.ts

import Transport from "@ledgerhq/hw-transport";
import { TransportError } from "@ledgerhq/errors";
import axios from "axios";

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
    const response = await axios({
      url,
      timeout,
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
    const response = await axios({
      method: "POST",
      url: this.url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        data: apduHex,
      }),
    });

    if (response.status !== 200) {
      throw new TransportError(
        "failed to communicate to server. code=" + response.status,
        "HttpTransportStatus" + response.status,
      );
    }

    const body: any = await response.data;
    if (body.error) throw body.error;
    return Buffer.from(body.data, "hex");
  }

  setScrambleKey() {}

  close(): Promise<void> {
    return Promise.resolve();
  }
}

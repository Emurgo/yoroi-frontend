// @flow

import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';
import type {
  ResponseTicker,
  CurrentCoinPriceResponse,
} from '../../app/api/ada/lib/state-fetch/types';

const CURRENCIES = ['BTC', 'ETH', 'USD', 'KRW', 'JPY', 'EUR', 'CNY'];

function genPrivKeyFunc(key: string) {
  return () => RustModule.WalletV3.PrivateKey.from_extended_bytes(Buffer.from(
    key,
    'hex',
  ));
}
let getPrivKey = genPrivKeyFunc('c8fc9467abae3c3396854ed25c59cc1d9a8ef3db9772f4cb0f074181ba4cad57eaa923bc58cbf6aff0aa34541e015d6cb6cf74b48d35f05f0ec4a907df64bad2');

let pubKeyDataReplacement;
let pubKeyDataSignature;

function serializeTicker(ticker: ResponseTicker): Buffer {
  return Buffer.from(
    ticker.from + ticker.timestamp +
      Object.keys(ticker.prices).sort().map(to => to + ticker.prices[to]).join(''),
    'utf8'
  );
}

let serviceDisabled = false;

export function disableService(): void {
  serviceDisabled = true;
}

export function installCoinPriceRequestHandlers(server: Object) {
  server.get('/price/:from/current', (req, res) => {
    if (serviceDisabled) {
      res.sendStatus(404);
      res.end();
      return;
    }

    const prices = {};
    for (const currency of CURRENCIES) {
      prices[currency] = 1;
    }

    const ticker: ResponseTicker = {
      from: 'ADA',
      timestamp: Date.now(),
      prices
    };
    ticker.signature = getPrivKey().sign(serializeTicker(ticker)).to_hex();
    const response : CurrentCoinPriceResponse = { error: null, ticker };
    if (pubKeyDataReplacement) {
      response.pubKeyData = pubKeyDataReplacement;
      response.pubKeyDataSignature = pubKeyDataSignature;
    }
    res.send(response);
  });

  server.get('/price/:from/:timestamps', (req, res) => {
    if (serviceDisabled) {
      res.sendStatus(404);
      res.end();
      return;
    }

    const timestamps = req.params.timestamps.split(',').map(Number);
    res.send({
      error: null,
      tickers: timestamps.map(timestamp => {
        const prices = {};
        for (const currency of CURRENCIES) {
          prices[currency] = 1;
        }

        const ticker: ResponseTicker = {
          from: 'ADA',
          timestamp,
          prices
        };
        ticker.signature = getPrivKey().sign(serializeTicker(ticker)).to_hex();
        return ticker;
      })
    });
  });
}

export function replaceKey(privKeyMaster: string, pubKeyData: string, privKeyData: string) {
  if (!privKeyMaster) {
    privKeyMaster = '7807bddb94f762ced05d2c65a954bba0c5b1972c7c90a04816fb3ce94613424fab23010c273d3d0e34ae3b644cc795d349439b8ead339cfbf35f0816038a7d4b';
  }
  if (!pubKeyData) {
    pubKeyData = '205395496e0489be7f441ece515f908738eeefb377dd89fb35a11a336e801742';
  }
  if (!privKeyData) {
    privKeyData = 'b02d80756fdb275f6e467f1b0eead5f1b4875d6db8855017a0a2f7addc888d4d1c0bcbb302230a8e9e3c3c44b90cd74f93e42e0deed7cba02f67d2d6e8e93868';
  }
  getPrivKey = genPrivKeyFunc(privKeyData);
  pubKeyDataReplacement = pubKeyData;
  pubKeyDataSignature = genPrivKeyFunc(privKeyMaster)()
    .sign(Buffer.from(pubKeyData))
    .to_hex();
}

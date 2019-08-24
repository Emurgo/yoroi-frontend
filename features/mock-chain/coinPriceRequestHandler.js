// @flow
import { SUPPORTED_CURRENCIES } from '../../app/config/coinPrice';
import { PrivateKey } from 'cardano-wallet';

const CURRENCIES = SUPPORTED_CURRENCIES.map(o => o.symbol);
const privKey = PrivateKey.from_hex('c8fc9467abae3c3396854ed25c59cc1d9a8ef3db9772f4cb0f074181ba4cad57eaa923bc58cbf6aff0aa34541e015d6cb6cf74b48d35f05f0ec4a907df64bad20000000000000000000000000000000000000000000000000000000000000000');

function serializeTicker(ticker: ResponseTicker): Buffer {
  return new Buffer(ticker.from +
    ticker.timestamp +
    Object.keys(ticker.prices).sort().map(to => to + ticker.prices[to]).join(''),
    'utf8'
  );
}

export function installCoinPriceRequestHandlers(server) {
  server.get('/price/:from/current', (req, res) => {
    let prices = {};
    for (const currency of CURRENCIES) {
      prices[currency] = 1;
    }

    const ticker = {
        from: 'ADA',
        timestamp: Date.now(),
        prices 
    };
    ticker.signature = privKey.sign(serializeTicker(ticker)).to_hex();
    res.send({
      error: null, 
      ticker
    });
  });

  server.get('/price/:from/:timestamps', (req, res) => {
    const timestamps = req.params.timestamps.split(',').map(Number);
    res.send({
      error: null,
      tickers: timestamps.map(timestamp => {
        let prices = {};
        for (const currency of CURRENCIES) {
          prices[currency] = 1;
        }

        const ticker = {
          from: 'ADA',
          timestamp,
          prices
        };
        ticker.signature = privKey.sign(serializeTicker(ticker)).to_hex();
        return ticker;
      })
    });
  });
}


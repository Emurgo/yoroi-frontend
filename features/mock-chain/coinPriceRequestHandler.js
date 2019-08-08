// @flow
import { SUPPORTED_CURRENCIES } from '../../app/config/coinPrice';

const CURRENCIES = SUPPORTED_CURRENCIES.map(o => o.symbol);

export function installCoinPriceRequestHandlers(server) {
  server.get('/price/:from/current', (req, res) => {
    res.send({
      error: null, 
      timestamp: Date.now(),
      tickers: CURRENCIES.map(c => ({ from: 'ADA', to: c, price: 1}))
    });
  });

  server.get('/price/:from/:timestamps', (req, res) => {
    const timestamps = req.params.timestamps.split(',').map(Number);
    res.send({
      error: null,
      timestamped_tickers: timestamps.map(timestamp => ({
        timestamp,
        tickers: CURRENCIES.map(c => ({ from: 'ADA', to: c, price: 1}))
      }))
    });
  });
}


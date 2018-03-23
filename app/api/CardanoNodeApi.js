
import { parseResponse, handleErrors } from './apiUtils';

const CardanoNodeApi = {};

CardanoNodeApi.config = {
  serverRoute: 'https://localhost:8080/api'
};

CardanoNodeApi.transactions = {};

CardanoNodeApi.transactions.buildTx = function ({ to, from, amount }) {
  // Fixme: remove re-assigments
  return Promise.resolve('g5+CANgYWCSCWCB4g7YtdrLfYo2Y0+0UczCsnNCtknH0ju4ECGQFIm9hVAH/n4KC2BhYIYNYHPj8vY0S5G6sIuIcZ9L4ZUberlHazG4Y0DG4PRegABr0/HxwGgXzUWyCgtgYWCGDWBz4/L2NEuRurCLiHGfS+GVG3q5R2sxuGNAxuD0XoAAa9Px8cAr/oA==');
  from = 'Ae2tdPwUPEZNJNLEk72hD4B74V94KCacoJkhSiL6xyVqSi1Xuk7qG4KrGsQ';
  to = 'DdzFFzCqrht4wFnWC5TJA5UUVE54JC9xZWq589iKyCrWa6hek3KKevyaXzQt6FsdunbkZGzBFQhwZi1MDpijwRoC7kj1MkEPh2Uu5Ssz';
  amount = 5;
  return fetch(`${CardanoNodeApi.config.serverRoute}/txs/unsigned/${from}/${to}/${amount}`, {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ groupingPolicy: 'OptimizeForHighThroughput' }),
  })
  .then(parseResponse)
  .then(handleErrors);
};

CardanoNodeApi.transactions.sendTx = function () {
  // TODO: Implement it!
};

export default CardanoNodeApi;

// @flow

type RestorationInput = {
  name: string,
  password: string,
  mnemonic: string,
  plate: string,
};

function createWallet(payload: {
  name: string,
  mnemonic: string,
  plate: string,
}) {
  const { name, mnemonic, plate } = payload;
  return { [name]: {
    name,
    mnemonic,
    plate,
    password: 'asdfasdfasdf',
  } };
}

// You can use this website to generate more mnemoncis if you need for testing
// https://iancoleman.io/bip39/

export const testWallets: { [key: string]: RestorationInput } = Object.assign(
  createWallet({
    name: 'small-single-tx',
    mnemonic: 'eight country switch draw meat scout mystery blade tip drift useless good keep usage title',
    plate: 'EAJD-7036',
  }),
  createWallet({
    name: 'failed-single-tx',
    mnemonic: 'broken common spring toilet work safe decrease equal velvet cluster myth old toy hold rain',
    plate: 'JSLX-5059',
  }),
  createWallet({
    name: 'many-tx-wallet',
    mnemonic: 'final autumn bacon fold horse scissors act pole country focus task blush basket move view',
    plate: 'ZKTZ-4614',
  }),
  createWallet({
    name: 'empty-wallet',
    mnemonic: 'burst hood dance captain city crane over olive notice sugar what bubble butter wealth grace',
    plate: 'ZPOX-6942',
  }),
  createWallet({
    name: 'simple-pending-wallet',
    mnemonic: 'ritual horn upon plastic foster enemy expect hand control coil jeans wolf arch isolate farm',
    plate: 'DPAH-1099',
  }),
  createWallet({
    name: 'tx-big-input-wallet',
    mnemonic: 'dragon mango general very inmate idea rabbit pencil element bleak term cart critic kite pill',
    plate: 'EDAO-9229',
  }),
);

// @flow

type RestorationInput = {|
  name: string,
  password: string,
  mnemonic: string,
  plate: string,
|};

function createWallet(payload: {|
  name: string,
  mnemonic: string,
  plate: string,
|}) {
  const { name, mnemonic, plate } = payload;
  return { [name]: {
    name,
    mnemonic,
    plate,
    password: 'asdfasdfasdf',
  } };
}

// You can use this website to generate more mnemonics if you need for testing
// https://iancoleman.io/bip39/

type WalletNames =
  'small-single-tx' |
  'failed-single-tx' |
  'many-tx-wallet' |
  'empty-wallet' |
  'simple-pending-wallet' |
  'tx-big-input-wallet' |
  'dump-wallet' |
  'shelley-test' |
  'ledger-wallet' |
  'trezor-wallet';

// eslint-disable-next-line prefer-object-spread
export const testWallets: { [key: WalletNames]: RestorationInput, ... } = Object.assign(
  {},
  createWallet({
    name: ('small-single-tx': WalletNames),
    mnemonic: 'eight country switch draw meat scout mystery blade tip drift useless good keep usage title',
    plate: 'EAJD-7036',
  }),
  createWallet({
    name: ('failed-single-tx': WalletNames),
    mnemonic: 'broken common spring toilet work safe decrease equal velvet cluster myth old toy hold rain',
    plate: 'JSLX-5059',
  }),
  createWallet({
    name: ('many-tx-wallet': WalletNames),
    mnemonic: 'final autumn bacon fold horse scissors act pole country focus task blush basket move view',
    plate: 'ZKTZ-4614',
  }),
  createWallet({
    name: ('empty-wallet': WalletNames),
    mnemonic: 'burst hood dance captain city crane over olive notice sugar what bubble butter wealth grace',
    plate: 'ZPOX-6942',
  }),
  createWallet({
    name: ('simple-pending-wallet': WalletNames),
    mnemonic: 'ritual horn upon plastic foster enemy expect hand control coil jeans wolf arch isolate farm',
    plate: 'DPAH-1099',
  }),
  createWallet({
    name: ('tx-big-input-wallet': WalletNames),
    mnemonic: 'dragon mango general very inmate idea rabbit pencil element bleak term cart critic kite pill',
    plate: 'EDAO-9229',
  }),
  createWallet({
    // a wallet to send stuff to when you need a tx output
    // but don't want to affect the other wallets for testing
    name: ('dump-wallet': WalletNames),
    mnemonic: 'proud nuclear patch arm digital theory peasant winner person knock mirror across immune certain power',
    plate: 'XXXX-1111',
  }),
  createWallet({
    name: ('shelley-test': WalletNames),
    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon address',
    plate: 'XXXX-1111',
  }),
  createWallet({
    name: ('ledger-wallet': WalletNames),
    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art',
    plate: 'JSKA-2258',
  }),
  createWallet({
    name: ('trezor-wallet': WalletNames),
    mnemonic: 'lyrics tray aunt muffin brisk ensure wedding cereal capital path replace weasel',
    plate: 'CXHB-0220',
  }),
);

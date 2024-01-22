// @flow

import { commonWalletPassword } from '../support/helpers/common-constants';

export type RestorationInput = {|
  name: string,
  password: string,
  mnemonic: string,
  plate: string,
  plateByron: string,
  deviceId: string,
|};

function getMnemonicFromEnv(walletName): string {
  return process.env[walletName] ?? '';
}

function createWallet(payload: {|
  name: string,
  mnemonic: string,
  plate: string,
  plateByron: string,
  deviceId: string,
|}) {
  const { name, mnemonic, plate, plateByron, deviceId } = payload;
  return { [name]: {
    name,
    mnemonic,
    plate,
    plateByron,
    password: commonWalletPassword,
    deviceId,
  } };
}

// You can use this website to generate more mnemonics if you need for testing
// https://iancoleman.io/bip39/

export type WalletNames =
  'shelley-simple-24' |
  'shelley-collateral' |
  'shelley-simple-15' |
  'shelley-delegated' |
  'shelley-ledger-delegated' |
  'shelley-only-registered' |
  'small-single-tx' |
  'failed-single-tx' |
  'many-tx-wallet' |
  'empty-wallet' |
  'simple-pending-wallet' |
  'tx-big-input-wallet' |
  'dump-wallet' |
  'ledger-wallet' |
  'trezor-wallet' |
  'shelley-enterprise' |
  'shelley-mangled' |
  'cardano-token-wallet' |
  'First-Smoke-Test-Wallet' |
  'Second-Smoke-Test-Wallet' |
  'Second-Smoke-Test-Wallet-FF';

// eslint-disable-next-line prefer-object-spread
export const testWallets: { [key: WalletNames]: RestorationInput, ... } = Object.assign(
  {},
  createWallet({
    name: ('small-single-tx': WalletNames),
    mnemonic: 'eight country switch draw meat scout mystery blade tip drift useless good keep usage title',
    plate: 'ZDDC-9858',
    plateByron: 'EAJD-7036',
    deviceId: '',
  }),
  createWallet({
    name: ('failed-single-tx': WalletNames),
    mnemonic: 'broken common spring toilet work safe decrease equal velvet cluster myth old toy hold rain',
    plate: 'JSLX-5059',
    plateByron: '',
    deviceId: '',
  }),
  createWallet({
    name: ('many-tx-wallet': WalletNames),
    mnemonic: 'final autumn bacon fold horse scissors act pole country focus task blush basket move view',
    plate: 'LAST-7650',
    plateByron: '',
    deviceId: '',
  }),
  createWallet({
    name: ('empty-wallet': WalletNames),
    mnemonic: 'burst hood dance captain city crane over olive notice sugar what bubble butter wealth grace',
    plate: 'PZEB-5741',
    plateByron: 'ZPOX-6942',
    deviceId: '',
  }),
  createWallet({
    name: ('simple-pending-wallet': WalletNames),
    mnemonic: 'ritual horn upon plastic foster enemy expect hand control coil jeans wolf arch isolate farm',
    plate: 'DPAH-1099',
    plateByron: '',
    deviceId: '',
  }),
  createWallet({
    name: ('tx-big-input-wallet': WalletNames),
    mnemonic: 'dragon mango general very inmate idea rabbit pencil element bleak term cart critic kite pill',
    plate: 'EDAO-9229',
    plateByron: '',
    deviceId: '',
  }),
  createWallet({
    // a wallet to send stuff to when you need a tx output
    // but don't want to affect the other wallets for testing
    name: ('dump-wallet': WalletNames),
    mnemonic: 'proud nuclear patch arm digital theory peasant winner person knock mirror across immune certain power',
    plate: 'XXXX-1111',
    plateByron: '',
    deviceId: '',
  }),
  createWallet({
    name: ('ledger-wallet': WalletNames),
    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art',
    plate: 'KHDC-5476',
    plateByron: 'JSKA-2258',
    deviceId: '707fa118bf6b83',
  }),
  createWallet({
    name: ('trezor-wallet': WalletNames),
    mnemonic: 'lyrics tray aunt muffin brisk ensure wedding cereal capital path replace weasel',
    plate: 'PXCA-2349',
    plateByron: 'CZSA-2051',
    deviceId: '6495958994A4025BB5EE1DB0',
  }),
  createWallet({
    name: ('shelley-simple-24': WalletNames),
    mnemonic: 'reunion walnut update express purse defense slice barrel estate olympic february flock give team alert coast luggage exhaust notable bag december split furnace sponsor',
    plate: 'DSKC-9213',
    plateByron: '',
    deviceId: '',
  }),
  createWallet({
    name: ('shelley-collateral': WalletNames),
    mnemonic: 'deal calm cloth world refuse pledge grant tuna inner body fat afford absorb off barely',
    plate: 'HLBZ-9462',
    plateByron: '',
    deviceId: '',
  }),
  createWallet({
    name: ('shelley-simple-15': WalletNames),
    mnemonic: 'eight country switch draw meat scout mystery blade tip drift useless good keep usage title',
    plate: 'ZDDC-9858',
    plateByron: '',
    deviceId: '',
  }),
  createWallet({
    name: ('shelley-delegated': WalletNames),
    mnemonic: 'parrot offer switch thank film high drop salute task train squirrel coral consider coyote evolve',
    plate: 'PALP-0076',
    plateByron: '',
    deviceId: '6495958994A4025BB5EE1DB1',
  }),
  createWallet({
    name: ('shelley-ledger-delegated': WalletNames),
    mnemonic: 'parrot offer switch thank film high drop salute task train squirrel coral consider coyote evolve',
    plate: 'PALP-0076',
    plateByron: '',
    deviceId: '707fa118bf6b84',
  }),
  createWallet({
    name: ('shelley-only-registered': WalletNames),
    mnemonic: 'pig organ result afraid abstract arrest brass kangaroo hub cube crunch return vibrant core make',
    plate: 'TDDO-4310',
    plateByron: '',
    deviceId: '',
  }),
  createWallet({
    name: ('shelley-enterprise': WalletNames),
    mnemonic: 'much million increase spot visa domain grow brother chief mechanic innocent envelope vacant bundle coyote',
    plate: 'HBDZ-9545',
    plateByron: '',
    deviceId: '',
  }),
  createWallet({
    name: ('shelley-mangled': WalletNames),
    mnemonic: 'weekend december choose maid rack helmet canoe bridge strike section lift autumn route practice seat',
    plate: 'JCEH-5025',
    plateByron: '',
    deviceId: '',
  }),
  createWallet({
    name: ('cardano-token-wallet': WalletNames),
    mnemonic: 'rent sword help dynamic enhance collect biology drama agent raven grape bike march length leisure',
    plate: 'HZPX-1482',
    plateByron: '',
    deviceId: '',
  }),
  createWallet({
    name: ('First-Smoke-Test-Wallet': WalletNames),
    mnemonic: getMnemonicFromEnv('FIRST_SMOKE_TEST_WALLET'),
    plate: 'XONT-4910',
    plateByron: '',
    deviceId: '',
  }),
  createWallet({
    name: ('Second-Smoke-Test-Wallet': WalletNames),
    mnemonic: getMnemonicFromEnv('SECOND_SMOKE_TEST_WALLET'),
    plate: 'XZHD-1651',
    plateByron: '',
    deviceId: '',
  }),
  createWallet({
    name: ('Second-Smoke-Test-Wallet-FF': WalletNames),
    mnemonic: getMnemonicFromEnv('SECOND_SMOKE_TEST_WALLET_FF'),
    plate: 'CJBE-8896',
    plateByron: '',
    deviceId: '',
  }),
);

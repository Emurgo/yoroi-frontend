// @flow

export type RestorationInput = {|
  name: string,
  password: string,
  mnemonic: string,
  plate: string,
  deviceId?: ?string,
|};

function createWallet(payload: {|
  name: string,
  mnemonic: string,
  plate: string,
  deviceId?: ?string,
|}) {
  const { name, mnemonic, plate } = payload;
  return { [name]: {
    name,
    mnemonic,
    plate,
    password: 'asdfasdfasdf',
    deviceId: payload.deviceId,
  } };
}

// You can use this website to generate more mnemonics if you need for testing
// https://iancoleman.io/bip39/

type WalletNames =
  'shelley-simple-24' |
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
  'jormungandr-test' |
  'ledger-wallet' |
  'trezor-wallet' |
  'ergo-simple-wallet' |
  'shelley-enterprise' |
  'shelley-mangled' |
  'ergo-token-wallet';

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
    name: ('jormungandr-test': WalletNames),
    mnemonic: '',
    plate: 'XXXX-1111',
  }),
  createWallet({
    name: ('ledger-wallet': WalletNames),
    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art',
    plate: 'JSKA-2258', // shelley plate KHDC-5476
    deviceId: '707fa118bf6b83',
  }),
  createWallet({
    name: ('trezor-wallet': WalletNames),
    mnemonic: 'lyrics tray aunt muffin brisk ensure wedding cereal capital path replace weasel',
    plate: 'CZSA-2051', // shelley plate PXCA-2349
    deviceId: '6495958994A4025BB5EE1DB0',
  }),
  createWallet({
    name: ('shelley-simple-24': WalletNames),
    mnemonic: 'reunion walnut update express purse defense slice barrel estate olympic february flock give team alert coast luggage exhaust notable bag december split furnace sponsor',
    plate: 'DSKC-9213',
  }),
  createWallet({
    name: ('shelley-simple-15': WalletNames),
    mnemonic: 'eight country switch draw meat scout mystery blade tip drift useless good keep usage title',
    plate: 'ZDDC-9858',
  }),
  createWallet({
    name: ('shelley-delegated': WalletNames),
    mnemonic: 'parrot offer switch thank film high drop salute task train squirrel coral consider coyote evolve',
    plate: 'PALP-0076',
    deviceId: '6495958994A4025BB5EE1DB1',
  }),
  createWallet({
    name: ('shelley-ledger-delegated': WalletNames),
    mnemonic: 'parrot offer switch thank film high drop salute task train squirrel coral consider coyote evolve',
    plate: 'PALP-0076',
    deviceId: '707fa118bf6b84',
  }),
  createWallet({
    name: ('shelley-only-registered': WalletNames),
    mnemonic: 'pig organ result afraid abstract arrest brass kangaroo hub cube crunch return vibrant core make',
    plate: 'TDDO-4310',
  }),
  createWallet({
    name: ('shelley-enterprise': WalletNames),
    mnemonic: 'much million increase spot visa domain grow brother chief mechanic innocent envelope vacant bundle coyote',
    plate: 'HBDZ-9545',
  }),
  createWallet({
    name: ('shelley-mangled': WalletNames),
    mnemonic: 'weekend december choose maid rack helmet canoe bridge strike section lift autumn route practice seat',
    plate: 'JCEH-5025',
  }),
  createWallet({
    name: ('ergo-simple-wallet': WalletNames),
    mnemonic: 'eight country switch draw meat scout mystery blade tip drift useless good keep usage title',
    plate: 'CXTP-1821',
  }),
  createWallet({
    name: ('ergo-token-wallet': WalletNames),
    mnemonic: 'rent sword help dynamic enhance collect biology drama agent raven grape bike march length leisure',
    plate: 'AZTH-1588',
  }),
);

// @flow

export const Explorer = Object.freeze({
  SEIZA: 'seiza',
  CLIO: 'clio',
  ADA_SCAN: 'adascan',
  CARDANO_EXPLORER: 'cardano_explorer',
});
export type ExplorerType = $Values<typeof Explorer>;

export const Link = Object.freeze({
  address: 'address',
  transaction: 'transaction',
});
export type LinkType = $Values<typeof Link>;

export type ExplorerInfo = {
  ...$Shape<$Inexact<typeof Link>>,
  name: string,
}
const seiza = {
  name: 'Seiza',
  address: 'https://seiza.com/blockchain/address/',
  transaction: 'https://seiza.com/blockchain/transaction/',
};

export const explorerInfo: {
  [key: ExplorerType]: ExplorerInfo,
  // assert that Seiza always has a URL for every type
  seiza: {
    ...$Shape<typeof Link>,
    name: string,
  }
} = Object.freeze({
  seiza,
  clio: {
    name: 'Clio.1',
    address: 'https://clio.one/tracker/address/',
  },
  adascan: {
    name: 'AdaScan',
    address: 'https://adascan.net/address/',
    transaction: 'https://adascan.net/transaction/',
  },
  cardano_explorer: {
    name: 'CardanoExplorer',
    address: 'https://cardanoexplorer.com/address/',
    transaction: 'https://cardanoexplorer.com/tx/',
  }
});

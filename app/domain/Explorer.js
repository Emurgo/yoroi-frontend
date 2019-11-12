// @flow

import environment from '../environment';

const ShelleyExplorers = Object.freeze({
  SEIZA: 'seiza',
  JORMUNGANDR: 'jormungandr',
});
const ByronExplorers = Object.freeze({
  SEIZA: 'seiza',
  CLIO: 'clio',
  ADA_SCAN: 'adascan',
  CARDANO_EXPLORER: 'cardano_explorer',
});
export function getDefaultExplorer(): ExplorerType {
  // TODO: change default back to Seiza once we have a public URL
  return environment.isShelley()
    ? 'jormungandr'
    : 'seiza';
}
export function getExplorers(): Array<{| value: ExplorerType, label: string |}> {
  if (environment.isShelley()) {
    return Object.keys(ShelleyExplorers)
      .filter(explorer => ShelleyExplorers[explorer] === ShelleyExplorers.JORMUNGANDR)
      .map(key => ({
        value: ShelleyExplorers[key],
        label: explorerInfo[ShelleyExplorers[key]].name,
      }));
  }
  return Object.keys(ByronExplorers)
    .map(key => ({
      value: ByronExplorers[key],
      label: explorerInfo[ByronExplorers[key]].name,
    }));
}
export const Explorer = environment.isShelley()
  ? ShelleyExplorers
  : ByronExplorers;
export type ExplorerType = $Values<typeof ShelleyExplorers> | $Values<typeof ByronExplorers>;

export const Link = Object.freeze({
  address: 'address',
  transaction: 'transaction',
});
export type LinkType = $Values<typeof Link>;

export type ExplorerInfo = {
  ...Inexact<typeof Link>,
  name: string,
}
const seiza = environment.isShelley()
  ? {
    name: 'Seiza',
    // TODO: proper URL for Shelley
    address: 'https://seiza.com/blockchain/address/',
    transaction: 'https://seiza.com/blockchain/transaction/',
  }
  : {
    name: 'Seiza',
    address: 'https://seiza.com/blockchain/address/',
    transaction: 'https://seiza.com/blockchain/transaction/',
  };

export const explorerInfo: {
  [key: ExplorerType]: ExplorerInfo,
  // assert that Seiza always has a URL for every type
  seiza: {
    ...typeof Link,
    name: string,
  }
} = Object.freeze({
  seiza,
  ...(!environment.isShelley()
    ? {
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
    }
    : {
      jormungandr: {
        name: 'Jormungandr Explorer',
        address: 'https://shelleyexplorer.cardano.org/address/',
        transaction: 'https://shelleyexplorer.cardano.org/tx/',
      },
    }
  )
});

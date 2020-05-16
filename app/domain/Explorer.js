// @flow

import environment from '../environment';

const ShelleyExplorers = Object.freeze({
  SEIZA: 'seiza',
  JORMUNGANDR: 'jormungandr',
  ADASTAT: 'adastat',
});
const ByronExplorers = Object.freeze({
  SEIZA: 'seiza',
  ADAEX: 'ADAex',
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
  const explorerInfo = getExplorerInfo();
  if (environment.isShelley()) {
    return Object.keys(ShelleyExplorers)
      .filter(explorer => ShelleyExplorers[explorer] !== ShelleyExplorers.SEIZA)
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
  pool: 'pool',
});
export type LinkType = $Values<typeof Link>;

export type ExplorerInfo = {|
  ...InexactSubset<typeof Link>,
  name: string,
|}
const seiza = environment.isShelley()
  ? {
    name: 'Seiza',
    // TODO: proper URL for Shelley
    address: 'https://seiza.com/blockchain/address/',
    transaction: 'https://seiza.com/blockchain/transaction/',
    pool: 'https://seiza.com/blockchain/stakepool/',
  }
  : {
    name: 'Seiza',
    address: 'https://seiza.com/blockchain/address/',
    transaction: 'https://seiza.com/blockchain/transaction/',
    pool: 'https://seiza.com/blockchain/stakepool/',
  };


function getIohkExplorer(): ExplorerInfo {
  const domain = 'https://shelleyexplorer.cardano.org';

  // TODO: send to different page based on locale
  return {
    name: 'Cardano Explorer',
    address: `${domain}/en/address/`,
    transaction: `${domain}/en/transaction/`,
    pool: `${domain}/en/stake-pool/`,
  };
}

const getExplorerInfo: void => {
  [key: ExplorerType]: ExplorerInfo,
  // assert that Seiza always has a URL for every type
  seiza: {|
    ...typeof Link,
    name: string,
  |},
  ...
} = () => Object.freeze({
  seiza,
  ...(!environment.isShelley()
    ? {
      adaex: {
        name: 'ADAex.org',
        address: 'https://adaex.org/',
      },
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
      jormungandr: getIohkExplorer(),
      adastat: {
        name: 'AdaStat',
        address: 'https://adastat.net/address/',
        transaction: 'https://adastat.net/transaction/',
        pool: 'https://adastat.net/pool/',
      },
    }
  )
});

export function getOrDefault(selectedExplorer: ExplorerType, linkType: LinkType): {|
  name: string,
  baseUrl: string,
|} {
  const explorerInfo = getExplorerInfo();
  const explorer = explorerInfo[selectedExplorer];

  // since not every explorer supports every feature
  // we default to Seiza if the link type doesn't exist for the selected explorer
  const baseUrl = explorer[linkType];
  if (!baseUrl) {
    return {
      name: explorerInfo.seiza.name,
      baseUrl: explorerInfo.seiza[linkType],
    };
  }

  return {
    name: explorer.name,
    baseUrl,
  };
}

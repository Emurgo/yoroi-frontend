// @flow

export type ConfigType = {|
  network: NetworkConfigType,
    poolExplorer: PoolExplorerConfigType,
      app: AppConfigType,
        bring: BringConfigType
          |};

export type BringConfigType = {|
  baseUrl: string,
    identifier: string,
      apiEndpoint: string
        |}

export type PoolExplorerConfigType = {|
  simpleTemplate: string,
|}

export type AppConfigType = {|
  walletRefreshInterval: number,
    serverStatusRefreshInterval: number,
      logsBufferSize: number,
        logsFileSuffix: string,
          addressRequestSize: number,
            txsBodiesRequestSize: number,
              coinPriceRefreshInterval: number,
                /**
                 * How long we should consider the "current price" valid.
                 * If wallet has been unable to connect to the server (ex: wallet is offline)
                 * We don't want to tell the user "this is the current price"
                */
                coinPriceFreshnessThreshold: number,
                  /** Public key we can use to make sure that the price information really dose come form EMURGO */
                  pubKeyData: string,
                    /** Public key to make sure that the ticker signing key change really does come from EMURGO */
                    pubKeyMaster: string,
|}

export type NetworkConfigType = {|
  name: Network,
    priceBackendUrl: string,
|};

export type Network = 'development' | 'mainnet' | 'test';
export const NetworkType: {|
  DEVELOPMENT: Network,
  MAINNET: Network,
  TEST: Network,
|} = {
  DEVELOPMENT: 'development',
    MAINNET: 'mainnet',
      TEST: 'test',
};

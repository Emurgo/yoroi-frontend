// @flow

import Store from '../base/Store';
import type { ActionsMap } from '../../actions';
import type { StoresMap } from '../index';
import { action, computed, observable } from 'mobx';
import type { StorageField } from '../../api/localStorage';
import { createStorageFlag } from '../../api/localStorage';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import {
  asGetAllUtxos,
  asHasUtxoChains,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { createMetadata } from '../../api/ada/lib/storage/bridge/metadataUtils';
import type { TxOutput } from '../../api/ada/transactions/shelley/transactions';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { Quantities } from '../../utils/quantities';
import BigNumber from 'bignumber.js';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import { cast, fail, hexToBytes, noop } from '../../coreUtils';
import { asAddressedUtxo, cardanoUtxoHexFromRemoteFormat} from '../../api/ada/transactions/utils';
import { genLookupOrFail, getTokenIdentifierIfExists, getTokenName } from '../stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters';
import adaLogo from '../../assets/images/ada.inline.svg';
import type { AssetAmount } from '../../components/swap/types';
import type { QueriedUtxo } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { transactionHexToHash } from '../../api/ada/lib/cardanoCrypto/utils';
import { signTransactionHex } from '../../api/ada/transactions/signTransactionHex';

const FRONTEND_FEE_ADDRESS_MAINNET =
  'addr1q9ry6jfdgm0lcrtfpgwrgxg7qfahv80jlghhrthy6w8hmyjuw9ngccy937pm7yw0jjnxasm7hzxjrf8rzkqcj26788lqws5fke';
const FRONTEND_FEE_ADDRESS_PREPROD =
  'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km';

export default class SwapStore extends Store<StoresMap, ActionsMap> {
  @observable limitOrderDisplayValue: string = '';
  @observable orderStep: number = 0;

  swapDisclaimerAcceptanceFlag: StorageField<boolean> = createStorageFlag(
    'SwapStore.swapDisclaimerAcceptanceFlag',
    false
  );

  @action setLimitOrderDisplayValue: string => void = (val: string) => {
    this.limitOrderDisplayValue = val;
  };

  @action resetLimitOrderDisplayValue: void => void = () => {
    this.limitOrderDisplayValue = '';
  };

  @action setOrderStepValue: number => void = (val: number) => {
    this.orderStep = val;
  };

  @computed get assets(): Array<AssetAmount> {
    const spendableBalance = this.stores.transactions?.balance;
    if (spendableBalance == null) return [];
    const getTokenInfo = genLookupOrFail(this.stores.tokenInfoStore?.tokenInfo);
    return [spendableBalance.getDefaultEntry(), ...spendableBalance.nonDefaultEntries()]
      .map(entry => ({
        entry,
        info: getTokenInfo(entry),
      }))
      .filter(t => !Boolean(t.info.IsNFT))
      .map(token => {
        const numberOfDecimals = token.info?.Metadata.numberOfDecimals ?? 0;
        const id = token.info.Identifier;
        const shiftedAmount = token.entry.amount.shiftedBy(-numberOfDecimals);
        const [beforeDecimal, afterDecimal] = splitAmount(shiftedAmount, numberOfDecimals);
        return {
          id,
          group: token.info?.Metadata.policyId,
          fingerprint: getTokenIdentifierIfExists(token.info) ?? '',
          name: truncateToken(getTokenName(token.info)),
          decimals: token.info?.Metadata.numberOfDecimals,
          ticker: token.info?.Metadata.ticker ?? truncateToken(getTokenName(token.info)),
          kind: token.info?.IsNFT ? 'nft' : 'ft',
          amount: [beforeDecimal, afterDecimal].join(''),
          description: '',
          image: id ? '' : adaLogo,
        };
      });
  }

  getUtxoHexForCancelCollateral: ({| wallet: PublicDeriver<> |}) => Promise<string> = async ({
    wallet,
  }) => {
    const utxo: QueriedUtxo = await this.stores.substores.ada.wallets.pickCollateralUtxo({
      wallet,
    });
    const [addressedUtxo] = asAddressedUtxo([utxo]);
    return cardanoUtxoHexFromRemoteFormat(cast(addressedUtxo));
  };

  createUnsignedSwapTx: ({|
    wallet: PublicDeriver<>,
    contractAddress: string,
    datum: string,
    datumHash: string,
    buy: {| tokenId: string, quantity: string |},
    sell: {| tokenId: string, quantity: string |},
    feFees: {| tokenId: string, quantity: string |},
    ptFees: {| deposit: string, batcher: string |},
    poolProvider: string,
  |}) => Promise<HaskellShelleyTxSignRequest> = ({
    wallet,
    contractAddress,
    datum,
    datumHash,
    buy,
    sell,
    feFees,
    ptFees,
    poolProvider,
  }) => {
    const metadata = createMetadata([
      {
        label: '674',
        data: {
          msg: splitStringInto64CharArray(
            JSON.stringify({
              provider: poolProvider,
              sellTokenId: sell.tokenId,
              sellQuantity: sell.quantity,
              buyTokenId: buy.tokenId,
              buyQuantity: buy.quantity,
            })
          ),
        },
      },
    ]);
    const withUtxos =
      asGetAllUtxos(wallet) ??
      fail(`${nameof(this.createUnsignedSwapTx)} missing utxo functionality`);
    const withHasUtxoChains =
      asHasUtxoChains(withUtxos) ??
      fail(`${nameof(this.createUnsignedSwapTx)} missing chains functionality`);
    const entries: Array<TxOutput> = [];
    entries.push({
      address: contractAddress,
      amount: createSwapOrderAmount({ wallet, sell, ptFees }),
      dataHash: datumHash,
      data: datum,
    });
    if (!Quantities.isZero(feFees.quantity)) {
      entries.push({
        address: wallet.isMainnet() ? FRONTEND_FEE_ADDRESS_MAINNET : FRONTEND_FEE_ADDRESS_PREPROD,
        amount: createSwapFeFeeAmount({ wallet, feFees }),
      });
    }
    return this.api.ada.createSimpleTx({
      publicDeriver: withHasUtxoChains,
      entries,
      metadata,
    });
  };

  executeCancelTransaction: ({|
    wallet: PublicDeriver<>,
    transactionHex: string,
    password: string,
  |}) => Promise<void> = async ({
    wallet,
    transactionHex,
    password,
  }) => {
    const signedTransactionHex =
      await signTransactionHex(wallet, password, transactionHex);
    await this.stores.substores.ada.stateFetchStore.fetcher.sendTx({
      id: transactionHexToHash(signedTransactionHex),
      encodedTx: hexToBytes(signedTransactionHex),
      network: wallet.getParent().getNetworkInfo(),
    });
    // Refresh call is non-blocking on purpose
    noop(this.stores.wallets.refreshWalletFromRemote(wallet));
  };
}

function createSwapFeFeeAmount({
  wallet,
  feFees,
}: {|
  wallet: PublicDeriver<>,
  feFees: {| tokenId: string, quantity: string |},
|}): MultiToken {
  const feFeeAmount: MultiToken = wallet.getParent().getDefaultMultiToken();
  feFeeAmount.add({
    networkId: feFeeAmount.getDefaults().defaultNetworkId,
    identifier: feFees.tokenId,
    amount: new BigNumber(feFees.quantity),
  });
  return feFeeAmount;
}

function createSwapOrderAmount({
  wallet,
  sell,
  ptFees,
}: {|
  wallet: PublicDeriver<>,
  sell: {| tokenId: string, quantity: string |},
  ptFees: {| deposit: string, batcher: string |},
|}): MultiToken {
  const orderAmount: MultiToken = wallet.getParent().getDefaultMultiToken();
  // entries will add together automatically in case they are both default token
  return orderAmount
    .add(orderAmount.createEntry(sell.tokenId, new BigNumber(sell.quantity)))
    .add(
      orderAmount.createDefaultEntry(
        new BigNumber(Quantities.sum([ptFees.deposit, ptFees.batcher]))
      )
    );
}

function splitStringInto64CharArray(inputString: string): string[] {
  const maxLength = 64;
  const resultArray: string[] = [];
  for (let i = 0; i < inputString.length; i += maxLength) {
    const substring = inputString.slice(i, i + maxLength);
    resultArray.push(substring);
  }
  return resultArray;
}

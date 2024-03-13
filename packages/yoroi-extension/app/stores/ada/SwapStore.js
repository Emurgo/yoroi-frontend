// @flow

import Store from '../base/Store';
import type { ActionsMap } from '../../actions';
import type { StoresMap } from '../index';
import { action, observable } from 'mobx';
import type { StorageField } from '../../api/localStorage';
import { createStorageFlag } from '../../api/localStorage';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import { asGetAllUtxos, asHasUtxoChains } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { createMetadata } from '../../api/ada/lib/storage/bridge/metadataUtils';
import type { TxOutput } from '../../api/ada/transactions/shelley/transactions';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { Quantities } from '../../utils/quantities';
import BigNumber from 'bignumber.js';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';

const FRONTEND_FEE_ADDRESS_MAINNET = 'addr1q9ry6jfdgm0lcrtfpgwrgxg7qfahv80jlghhrthy6w8hmyjuw9ngccy937pm7yw0jjnxasm7hzxjrf8rzkqcj26788lqws5fke';
const FRONTEND_FEE_ADDRESS_PREPROD = 'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km';

export default class SwapStore extends Store<StoresMap, ActionsMap> {

  @observable limitOrderDisplayValue: string = '';

  swapDisclaimerAcceptanceFlag: StorageField<boolean> =
    createStorageFlag('SwapStore.swapDisclaimerAcceptanceFlag', false);

  @action setLimitOrderDisplayValue: string => void = (val: string) => {
    this.limitOrderDisplayValue = val;
  }

  @action resetLimitOrderDisplayValue: void => void = () => {
    this.limitOrderDisplayValue = '';
  }

  createUnsignedSwapTx: ({|
    wallet: PublicDeriver<>,
    contractAddress: string,
    datum: string,
    buy: {| tokenId: string, quantity: string |},
    sell: {| tokenId: string, quantity: string |},
    feFees: {| tokenId: string, quantity: string |},
    ptFees: {| deposit: string, batcher: string |},
    poolProvider: string,
  |}) => Promise<void> = async ({
    wallet,
    contractAddress,
    datum,
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
            }),
          ),
        },
      },
    ]);
    const withUtxos = asGetAllUtxos(wallet)
      ?? fail(`${nameof(this.createUnsignedSwapTx)} missing utxo functionality`);
    const withHasUtxoChains = asHasUtxoChains(withUtxos)
      ?? fail(`${nameof(this.createUnsignedSwapTx)} missing chains functionality`);
    const entries: Array<TxOutput> = [];
    entries.push({
      address: contractAddress,
      amount: createSwapOrderAmount({ wallet, sell, ptFees }),
      data: datum,
    });
    if (!Quantities.isZero(feFees.quantity)) {
      entries.push({
        address: wallet.isMainnet() ? FRONTEND_FEE_ADDRESS_MAINNET : FRONTEND_FEE_ADDRESS_PREPROD,
        amount: createSwapFeFeeAmount({ wallet, feFees }),
      });
    }
    try {
      const signRequest: HaskellShelleyTxSignRequest = await this.api.ada.createSimpleTx({
        publicDeriver: withHasUtxoChains,
        entries,
        metadata,
      });
      const tx = signRequest.unsignedTx.build_tx();
      console.log('>>> SWAP TX: ', tx.to_hex());
    } catch (e) {
      console.error('Failed tp produce swap transaction', e);
    }
  }
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
  })
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
  const networkId = orderAmount.getDefaults().defaultNetworkId;
  const defaultIdentifier = orderAmount.getDefaults().defaultIdentifier;
  if (sell.tokenId === defaultIdentifier) {
    // combine sell with fees
    orderAmount.add({
      networkId,
      identifier: defaultIdentifier,
      amount: new BigNumber(Quantities.sum([sell.quantity, ptFees.deposit, ptFees.batcher])),
    });
  } else {
    //separate sell and fees
    orderAmount.add({
      networkId,
      identifier: sell.tokenId,
      amount: new BigNumber(sell.quantity),
    }).add({
      networkId,
      identifier: defaultIdentifier,
      amount: new BigNumber(Quantities.sum([ptFees.deposit, ptFees.batcher]))
    });
  }
  return orderAmount;
}

function splitStringInto64CharArray(inputString: string): string[] {
  const maxLength = 64
  const resultArray: string[] = []
  for (let i = 0; i < inputString.length; i += maxLength) {
    const substring = inputString.slice(i, i + maxLength)
    resultArray.push(substring)
  }
  return resultArray
}

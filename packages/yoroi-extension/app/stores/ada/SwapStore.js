// @flow

import Store from '../base/Store';
import type { ActionsMap } from '../../actions';
import type { StoresMap } from '../index';
import { action, observable } from 'mobx';
import type { StorageField } from '../../api/localStorage';
import { createStorageFlag } from '../../api/localStorage';

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
    buy: {| tokenId: string, quantity: string |},
    sell: {| tokenId: string, quantity: string |},
    poolProvider: string,
  |}) => void = ({ buy, sell, poolProvider }) => {
    const metadata = [
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
    ];
  }
}

export const splitStringInto64CharArray = (inputString: string): string[] => {
  const maxLength = 64
  const resultArray: string[] = []
  for (let i = 0; i < inputString.length; i += maxLength) {
    const substring = inputString.slice(i, i + maxLength)
    resultArray.push(substring)
  }
  return resultArray
}

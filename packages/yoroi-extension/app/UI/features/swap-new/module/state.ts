import { invalid } from "@yoroi/common";
import { produce } from "immer";

export type Asset = any; // Placeholder for the actual asset type

export type SwapActions = {
  selectAssetToSell: (asset: any) => void;
  selectAssetToBuy: (asset: any) => void;
};

export const SwapActionType = Object.freeze({
  SelectAssetToSell: 'selectAssetToSell',
  SelectAssetToBuy: 'selectAssetToBuy',
});

export type SwapAction =
  | {
      type: typeof SwapActionType.SelectAssetToSell;
      asset: Asset;
    }
  | {
      type: typeof SwapActionType.SelectAssetToBuy;
      asset: Asset;
    };


    // Define state type
export type SwapState = {
  assetToSell: Asset;
  assetToBuy: Asset;
};

// Define default state
export const defaultSwapState = {
  assetToSell: null,
  assetToBuy: null,
};

// Define action handlers
export const defaultSwapActions: SwapActions = {
  selectAssetToBuy: () => invalid('missing asset to sell'),
  selectAssetToSell: () => invalid('missing asset to buy'),
};

// Reducer function
export const SwapReducer = (state: SwapState, action: SwapAction): SwapState => {
  return produce(state, draft => {
    switch (action.type) {
      case SwapActionType.SelectAssetToSell:
        draft.assetToSell = action.asset;
        break;
      case SwapActionType.SelectAssetToBuy:
        draft.assetToBuy = action.asset;
        break;
      default:
        return;
    }
  });
};

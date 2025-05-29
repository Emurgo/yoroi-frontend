import * as React from 'react';

import { unwrapStakingKey } from '../../../../api/ada/lib/storage/bridge/utils';
import { swapManagerMaker, swapStorageMaker } from '@yoroi/swap';
import { isPrimaryToken } from '@yoroi/portfolio';
import { isLeft, isRight } from '@yoroi/common';
import { useSwapConfig } from '../common/hooks/useSwapConfig';
import { useQuery } from 'react-query';
import { Api, Chain, Portfolio, Swap } from '@yoroi/types';
import { RustModule } from '../../../../api/ada/lib/cardanoCrypto/rustLoader';
import { produce } from 'immer';
import { primaryTokenInfoMainnet } from '../../../utils/network-config';
import { undefinedToken } from '../common/constants';

export const convertBech32ToHex = async (bech32Address: string) => {
  // const address = await RustModule.WalletV4.Address.from_bech32(bech32Address);
  // const bytes = await address.to_bytes();
  // return await Buffer.from(bytes).toString('hex');
  return await RustModule.WalletV4.Address.from_bech32(bech32Address).to_hex();
};

export const useAddressHex = address => {
  const result = useQuery([address, 'addressHex'], () => convertBech32ToHex(address), {
    suspense: true,
  });
  if (!result.data) throw new Error('invalid state');
  return result.data;
};

export const SwapContextProvider = ({ children, currentWallet, stores }: any) => {
  if (!currentWallet?.selectedWallet) throw new Error(`requires a wallet to be selected`);
  const { ftAssetList, primaryTokenInfo, walletAddresses } = currentWallet;
  const [stakingKey, setStakingKey] = React.useState(null);
  const { partners, excludedTokens } = useSwapConfig();
  const addressHex = useAddressHex(walletAddresses[0]);

  const [state, action] = React.useReducer(swapReducer, defaultState);

  console.log('CONTEXT INFO', { state, partners, excludedTokens });

  React.useEffect(() => {
    const stakignAddr = stores.wallets.selected.stakingAddress;
    const skey = unwrapStakingKey(stakignAddr).to_keyhash()?.to_hex();
    if (skey == null) {
      throw new Error('Cannot get staking key from the wallet!');
    }
    setStakingKey(skey);
  }, []);

  const swapManager = React.useMemo(() => {
    const storage = swapStorageMaker();
    console.log('swapStorageMaker Data', {
      storage,
      network: Chain.Network.Mainnet,
      stakingKey: String(stakingKey),
      address: walletAddresses[0],
      addressHex: addressHex,
      primaryTokenInfo: primaryTokenInfo,
      isPrimaryToken: isPrimaryToken,
      partners,
    });
    return swapManagerMaker({
      storage,
      network: Chain.Network.Mainnet,
      stakingKey: String(stakingKey),
      address: walletAddresses[0],
      addressHex: addressHex,
      primaryTokenInfo: primaryTokenInfo,
      isPrimaryToken: isPrimaryToken,
      partners,
    });
  }, [stakingKey, primaryTokenInfo, addressHex, partners, walletAddresses[0]]);

  const { data: tokens = [], refetch: refetchTokens } = useQuery({
    queryKey: ['useSwapTokens', swapManager.settings.routingPreference],
    queryFn: async () => {
      const res = await swapManager.api.tokens();
      console.log('RESPONSE swapManager.api.tokens', res);

      if (isRight(res)) {
        const filteredTokens = res.value.data
          .filter(token => !excludedTokens.includes(token.id)) // remove excluded tokens
          .map(token => ({
            status: token.status,
            id: token.id,
            ticker: token.ticker,
            name: token.name,
            type: token.type,
            nature: token.nature,

            fingerprint: token.fingerprint,
            decimals: token.decimals,
            description: token.description,
            originalImage: token.originalImage,
            symbol: token.symbol,
            tag: token.tag,
            website: token.website,
          }));

        const availableIds = filteredTokens.map(token => token.id);
        const currentTokenId = state.tokenOutInput?.info?.id ?? undefinedToken;

        if (!availableIds.includes(currentTokenId)) {
          action({ type: 'ResetForm' });
        }

        return filteredTokens;
      }

      return [];
    },
  });
  React.useEffect(() => {
    refetchTokens();
  }, [addressHex]);

  console.log('tokenIds', tokens);

  // const actions = React.useRef({
  //   selectAssetToSell: (asset: any) => {
  //     dispatch({
  //       type: SwapActionType.SelectAssetToSell,
  //       asset: asset,
  //     });
  //   },
  //   selectAssetToBuy: (asset: any) => {
  //     dispatch({
  //       type: SwapActionType.SelectAssetToSell,
  //       asset: asset,
  //     });
  //   },
  // }).current;

  const context: any = {
    swapForm: { action, ...state },
    ftAssetList: ftAssetList || [],
    primaryTokenInfo,
    assetsStore: stores.substores.ada.swapStore.assets,
  };

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>;
};

export const useSwapRevamp = () =>
  React.useContext(SwapContext) ?? console.log('useSwapRevamp: needs to be wrapped in a SwapContextProvider');

const swapReducer = (state: SwapState, action: SwapAction) => {
  return produce(state, draft => {
    draft.needsNewEstimate = true;
    draft.lastInputTouched = 'in';

    switch (action.type) {
      case SwapAction.ChangeOrderType:
        draft.orderType = action.value;
        break;

      case SwapAction.TokenInInputTouched:
        draft.tokenInInput.isTouched = true;
        draft.tokenInInput.value = '';
        draft.tokenInInput.error = null;
        break;

      case SwapAction.TokenOutInputTouched:
        draft.tokenOutInput.isTouched = true;
        draft.tokenOutInput.value = '';
        draft.tokenOutInput.error = null;
        break;

      case SwapAction.TokenInIdChanged:
        draft.tokenInInput = action.value;
        draft.selectedProtocol.isTouched = false;
        draft.wantedPrice = '';

        break;

      case SwapAction.TokenOutIdChanged:
        draft.tokenOutInput = action.value;
        draft.selectedProtocol.isTouched = false;
        draft.wantedPrice = '';

        break;

      case SwapAction.TokenInAmountChanged:
        draft.tokenInInput.value = parseNumber(action.value);
        if (action.value === '' || action.value === '0') {
          draft.tokenOutInput.value = '0';
          draft.estimate = undefined;
          draft.needsNewEstimate = false;
        }
        break;

      case SwapAction.TokenOutAmountChanged:
        draft.lastInputTouched = 'out';
        draft.tokenOutInput.value = parseNumber(action.value);
        if (action.value === '' || action.value === '0') {
          draft.tokenInInput.value = '0';
          draft.estimate = undefined;
          draft.needsNewEstimate = false;
        }
        break;

      case SwapAction.TokenInErrorChanged:
        draft.lastInputTouched = state.lastInputTouched;
        draft.tokenInInput.error = action.value;
        draft.needsNewEstimate = false;
        break;

      case SwapAction.TokenOutErrorChanged:
        draft.lastInputTouched = state.lastInputTouched;
        draft.tokenOutInput.error = action.value;
        draft.needsNewEstimate = false;
        break;

      case SwapAction.SlippageInputChanged:
        draft.slippageInput.value = action.value;
        break;

      case SwapAction.WantedPriceInputChanged:
        draft.wantedPrice = parseNumber(action.value);
        if (Number(draft.wantedPrice) === 0) draft.needsNewEstimate = false;
        break;

      case SwapAction.SwitchTouched:
        draft.tokenOutInput.isTouched = state.tokenInInput.isTouched;
        draft.tokenOutInput.tokenInfo = state.tokenInInput.tokenInfo;
        draft.tokenOutInput.value = '';
        draft.tokenOutInput.error = null;

        draft.tokenInInput.isTouched = state.tokenOutInput.isTouched;
        draft.tokenInInput.tokenInfo = state.tokenOutInput.tokenInfo;
        draft.tokenInInput.value = state.tokenOutInput.value;
        draft.tokenInInput.error = null;

        draft.wantedPrice = '';
        break;

      case SwapAction.ProtocolSelected:
        draft.selectedProtocol.isTouched = true;
        draft.selectedProtocol.value = action.value;
        break;

      case SwapAction.ProtocolChanged:
        draft.selectedProtocol.isTouched = false;
        draft.selectedProtocol.value = action.value;
        break;

      case SwapAction.Refresh:
        draft.lastInputTouched = state.lastInputTouched;
        draft.tokenInInput.error = null;
        draft.tokenOutInput.error = null;
        break;

      case SwapAction.ResetAmounts:
        draft.tokenInInput.value = '';
        draft.tokenOutInput.value = '';

        draft.tokenInInput.error = null;
        draft.tokenOutInput.error = null;
        break;

      case SwapAction.ResetForm:
        draft = defaultState;
        break;

      case SwapAction.EstimateResponse:
        draft.lastInputTouched = state.lastInputTouched;
        draft.needsNewEstimate = false;
        draft.estimate = action.value;
        draft.tokenOutInput.error = null;
        draft.canSwap = true;

        if (state.lastInputTouched === 'in') {
          draft.tokenOutInput.value = String(action.value.totalOutputWithoutSlippage ?? 0);
        } else {
          draft.tokenInInput.value = String(action.value.totalInput ?? 0);
        }
        break;

      case SwapAction.EstimateError:
        draft.needsNewEstimate = false;
        draft.estimate = undefined;
        draft.tokenOutInput.error = action.value.message;
        draft.canSwap = false;
        break;

      case SwapAction.CreateResponse:
        draft.needsNewEstimate = false;
        draft.createTx = action.value;
        break;

      case SwapAction.CreateError:
        draft.needsNewEstimate = false;
        draft.createTx = undefined;
        draft.tokenOutInput.error = action.value.message;
        break;

      default:
        throw new Error(`swapReducer invalid action`);
    }
  });
};

export const SwapAction = {
  ChangeOrderType: 'ChangeOrderType',
  TokenInInputTouched: 'TokenInInputTouched',
  TokenOutInputTouched: 'TokenOutInputTouched',
  TokenInIdChanged: 'TokenInIdChanged',
  TokenOutIdChanged: 'TokenOutIdChanged',
  TokenInAmountChanged: 'TokenInAmountChanged',
  TokenOutAmountChanged: 'TokenOutAmountChanged',
  TokenInErrorChanged: 'TokenInErrorChanged',
  TokenOutErrorChanged: 'TokenOutErrorChanged',
  WantedPriceInputChanged: 'WantedPriceInputChanged',
  SlippageInputChanged: 'SlippageInputChanged',
  SwitchTouched: 'SwitchTouched',
  ProtocolSelected: 'ProtocolSelected',
  ProtocolChanged: 'ProtocolChanged',
  Refresh: 'Refresh',
  ResetAmounts: 'ResetAmounts',
  ResetForm: 'ResetForm',
  EstimateResponse: 'EstimateResponse',
  EstimateError: 'EstimateError',
  CreateResponse: 'CreateResponse',
  CreateError: 'CreateError',
} as const;

type SwapActionValueMap = {
  ChangeOrderType: 'limit' | 'market';
  TokenInInputTouched: undefined;
  TokenOutInputTouched: undefined;
  TokenInIdChanged: any;
  TokenOutIdChanged: any;
  TokenInAmountChanged: string;
  TokenOutAmountChanged: string;
  TokenInErrorChanged: string | null;
  TokenOutErrorChanged: string | null;
  WantedPriceInputChanged: string;
  SlippageInputChanged: number;
  SwitchTouched: undefined;
  ProtocolSelected: Swap.Protocol;
  ProtocolChanged: Swap.Protocol | undefined;
  Refresh: undefined;
  ResetAmounts: undefined;
  ResetForm: undefined;
  EstimateResponse: Swap.EstimateResponse;
  EstimateError: Api.ResponseError;
  CreateResponse: Swap.CreateResponse;
  CreateError: Api.ResponseError;
};

export type SwapAction = {
  [K in keyof SwapActionValueMap]: SwapActionValueMap[K] extends undefined
    ? { type: K }
    : { type: K; value: SwapActionValueMap[K] };
}[keyof SwapActionValueMap];

const defaultState: SwapState = Object.freeze({
  needsNewEstimate: false,
  orderType: 'market',
  lastInputTouched: 'in',
  tokenInInput: {
    isTouched: true,
    tokenInfo: primaryTokenInfoMainnet,
    disabled: false,
    error: null,
    value: '',
  },
  tokenOutInput: {
    isTouched: false,
    tokenInfo: undefined,
    disabled: false,
    error: null,
    value: '',
  },
  slippageInput: {
    value: 1,
  },
  selectedProtocol: {
    isTouched: false,
    value: undefined,
  },
  wantedPrice: '',
  canSwap: false,
  estimate: undefined,
  createTx: undefined,
  cancelTx: undefined,
  cancelError: undefined,
} as const);

type SwapState = {
  needsNewEstimate: boolean;
  orderType: 'market' | 'limit';
  lastInputTouched: 'in' | 'out';
  tokenInInput: {
    isTouched: boolean;
    tokenInfo?: any | null;
    disabled: boolean;
    error: string | null;
    value: string;
  };
  tokenOutInput: {
    isTouched: boolean;
    tokenInfo?: any | null;
    disabled: boolean;
    error: string | null;
    value: string;
  };
  slippageInput: {
    value: number;
  };
  selectedProtocol: {
    isTouched: boolean;
    value?: Swap.Protocol;
  };
  wantedPrice: string;
  canSwap: boolean;
  estimate?: Swap.EstimateResponse;
  createTx?: Swap.CreateResponse;
};

export type SwapContext = SwapState & {
  isLoading: boolean;
  limitOptions?: Swap.LimitOptionsResponse;
  tokenInfos: Map<Portfolio.Token.Id, Portfolio.Token.Info>;
  tokenInInputRef: React.RefObject<any> | undefined;
  tokenOutInputRef: React.RefObject<any> | undefined;
  wantedPriceInputRef: React.RefObject<any> | undefined;
  orders?: Array<Swap.Order>;
  action: React.Dispatch<SwapAction>;
  create: () => void;
  cancel: Swap.Api['cancel'];
  managerSettings: Swap.ManagerSettings;
  assignManagerSettings: Swap.Manager['assignSettings'];
  refetchOrders: () => void;
};

const SwapContext = React.createContext<SwapContext>({
  ...defaultState,
  isLoading: false,
  tokenInfos: new Map<Portfolio.Token.Id, Portfolio.Token.Info>(),
  tokenInInputRef: undefined,
  tokenOutInputRef: undefined,
  wantedPriceInputRef: undefined,
  orders: undefined,
  action: () => null,
  create: () => null,
  cancel: () => new Promise(res => res),
  managerSettings: { routingPreference: 'auto', slippage: 1 },
  assignManagerSettings: () => ({ routingPreference: 'auto', slippage: 1 }),
  refetchOrders: () => null,
});

const parseNumber = (text: string) =>
  !Number.isNaN(Number(text.replace(',', '.')))
    ? text
        .replace(',', '.')
        .replace(/^0+(.+)/, '$1')
        .replace(/^\.$/, '0.')
    : '0';

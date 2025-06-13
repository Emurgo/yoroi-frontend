import { useMemo, useReducer, useContext, useRef, useState, useEffect, createContext, RefObject, Dispatch } from 'react';
import { unwrapStakingKey } from '../../../../api/ada/lib/storage/bridge/utils';
import { swapManagerMaker, swapStorageMaker } from '@yoroi/swap';
import { isPrimaryToken, primaryTokenId } from '@yoroi/portfolio';
import { useSwapConfig } from '../common/hooks/useSwapConfig';
import { useQuery } from 'react-query';
import { Api, Chain, Portfolio, Swap } from '@yoroi/types';
import { RustModule } from '../../../../api/ada/lib/cardanoCrypto/rustLoader';
import { produce } from 'immer';
import { tokenManagers } from '../../portfolio/common/helpers/build-token-manager';
import { useSyncedTokenInfos } from '../common/hooks/useTokensInfo';

export const convertBech32ToHex = async (bech32Address: string) => {
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
  const { ftAssetList, primaryTokenInfo, walletAddresses, selectedWallet, explorer } = currentWallet;

  const [stakingKey, setStakingKey] = useState<string | null>(null);
  const { partners, excludedTokens } = useSwapConfig();

  const tokenManager = tokenManagers[Chain.Network.Mainnet as Chain.SupportedNetworks];
  const tokenOutInputRef = useRef<any | null>(null);
  const tokenInInputRef = useRef<any | null>(null);

  const [state, action] = useReducer(swapReducer, defaultState);

  useEffect(() => {
    const stakignAddr = stores.wallets.selected.stakingAddress;
    const skey = unwrapStakingKey(stakignAddr).to_keyhash()?.to_hex();
    if (skey == null) {
      throw new Error('Cannot get staking key from the wallet!');
    }
    setStakingKey(skey);
  }, []);

  const swapManager = useMemo(() => {
    const storage = swapStorageMaker();

    return swapManagerMaker({
      storage,
      network: Chain.Network.Mainnet,
      stakingKey: String(stakingKey),
      address: walletAddresses[0],
      addressHex: String(stakingKey),
      primaryTokenInfo,
      isPrimaryToken,
      partners,
    });
  }, [stakingKey, primaryTokenInfo, partners, walletAddresses[0]]);

  const { data: { tokenInfos = new Map(), tokenInfoList = [] } = {}, isLoading: loadingTokenList } = useSyncedTokenInfos({
    swapManager,
    tokenManager,
    primaryTokenInfo,
    networkId: Chain.Network.Mainnet,
    excludedTokens: excludedTokens.concat(ftAssetList.map(asset => asset.info.id)),
  });

  if (!selectedWallet) return null;

  const context: any = useMemo(
    () => ({
      swapForm: { action, ...state },
      tokenInfos,
      tokenInfoList,
      tokenInInputRef,
      tokenOutInputRef,
      ftAssetList: ftAssetList || [],
      primaryTokenInfo,
      assetsStore: stores.substores.ada.swapStore.assets,
      tokenManager,
      loadingTokenList,
      explorer,
    }),
    [state.tokenInInput, state.tokenOutInput, action, tokenInfos]
  );

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>;
};

export const useSwapRevamp = () => useContext(SwapContext) ?? console.log('useSwapRevamp: needs to be wrapped in a SwapContextProvider');

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
        if ('value' in action) {
          draft.tokenInInput.tokenId = action.value;
          draft.selectedProtocol.isTouched = false;
          draft.wantedPrice = '';
        }
        break;

      case SwapAction.TokenOutIdChanged:
        if ('value' in action) {
          draft.tokenOutInput.tokenId = action.value;
          draft.selectedProtocol.isTouched = false;
          draft.wantedPrice = '';
        }
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
        draft.tokenOutInput.tokenId = state.tokenInInput.tokenId;
        draft.tokenOutInput.value = '';
        draft.tokenOutInput.error = null;

        draft.tokenInInput.isTouched = state.tokenOutInput.isTouched;
        draft.tokenInInput.tokenId = state.tokenOutInput.tokenId;
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
    tokenId: primaryTokenId,
    disabled: false,
    error: null,
    value: '',
  },
  tokenOutInput: {
    isTouched: false,
    tokenId: undefined,
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
    tokenId?: Portfolio.Token.Id;
    disabled: boolean;
    error: string | null;
    value: string;
  };
  tokenOutInput: {
    isTouched: boolean;
    tokenId?: Portfolio.Token.Id;
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
  tokenInInputRef: RefObject<any> | undefined;
  tokenOutInputRef: RefObject<any> | undefined;
  wantedPriceInputRef: RefObject<any> | undefined;
  orders?: Array<Swap.Order>;
  action: Dispatch<SwapAction>;
  create: () => void;
  cancel: Swap.Api['cancel'];
  managerSettings: Swap.ManagerSettings;
  assignManagerSettings: Swap.Manager['assignSettings'];
  refetchOrders: () => void;
  // TODO define after
  ftAssetList: any;
  tokenInfoList: any;
  swapForm: any;
  primaryTokenInfo: any;
  loadingTokenList: boolean;
  explorer: { tokenInfo: { name: string; baseUrl: string } };
};

const SwapContext = createContext<SwapContext>({
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
  ftAssetList: [],
  tokenInfoList: [],
  swapForm: {},
  primaryTokenInfo: {},
  loadingTokenList: false,
  explorer: { tokenInfo: { name: '', baseUrl: '' } },
});

const parseNumber = (text: string) =>
  !Number.isNaN(Number(text.replace(',', '.')))
    ? text
        .replace(',', '.')
        .replace(/^0+(.+)/, '$1')
        .replace(/^\.$/, '0.')
    : '0';

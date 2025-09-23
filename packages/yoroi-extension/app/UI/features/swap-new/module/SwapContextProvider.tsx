import {
  useMemo,
  useReducer,
  useContext,
  useRef,
  useState,
  useEffect,
  createContext,
  RefObject,
  Dispatch,
  useCallback,
} from 'react';
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
import { isLeft, isRight } from '@yoroi/common';
import { useGetInputs } from '../common/helpers';
import { ASSET_DIRECTION_IN } from '../common/constants';
import { AssetDirectionType, MarketOrderType } from '../common/types';

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
  const [isCreateOrderLoading, setIsCreateOrderLoading] = useState(false);
  const [isEstimateOrderLoading, setIsEstimateOrderLoading] = useState(false);

  const [stakingKey, setStakingKey] = useState<string | null>(null);
  const { partners, excludedTokens, tokenOutId } = useSwapConfig();

  const tokenManager = tokenManagers[Chain.Network.Mainnet as Chain.SupportedNetworks];
  const tokenOutInputRef = useRef<HTMLInputElement | null>(null);
  const tokenInInputRef = useRef<HTMLInputElement | null>(null);

  const { getInputs } = useGetInputs(selectedWallet?.utxos || []);

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
      address: walletAddresses[1],
      addressHex: String(stakingKey),
      primaryTokenInfo,
      isPrimaryToken,
      partners,
    });
  }, [stakingKey, primaryTokenInfo, partners]);

  const { data: { tokenInfos = new Map(), tokenInfoList = [] } = {}, isLoading: loadingTokenList } = useSyncedTokenInfos({
    swapManager,
    tokenManager,
    primaryTokenInfo,
    networkId: Chain.Network.Mainnet,
    excludedTokens: excludedTokens,
  });

  useEffect(() => {
    if (tokenOutId) {
      action({ type: SwapAction.TokenOutIdChanged, value: tokenOutId });
    }
  }, [tokenOutId]);

  useEffect(() => {
    action({ type: 'SlippageInputChanged', value: swapManager.settings.slippage });
  }, [swapManager.settings.slippage]);

  const { data: limitOptions, isLoading: isLimitOptionsLoading } = useQuery(
    [
      'useSwapLimitOptions',
      'mainet',
      swapManager.settings.routingPreference,
      state.tokenInInput.tokenId,
      state.tokenOutInput.tokenId,
    ],
    async () => {
      if (state.tokenInInput.tokenId === undefined || state.tokenOutInput.tokenId === undefined) throw Error();

      const res = await swapManager.api.limitOptions({
        tokenIn: state.tokenInInput.tokenId,
        tokenOut: state.tokenOutInput.tokenId,
      });

      if (isRight(res)) return res.value.data;
      return undefined;
    },
    {
      enabled:
        state.orderType === 'limit' && state.tokenInInput.tokenId !== undefined && state.tokenOutInput.tokenId !== undefined,
    }
  );

  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ['useSwapOrders', stakingKey, swapManager.settings.routingPreference],
    queryFn: async () => {
      const res = await swapManager.api.orders();
      if (isRight(res)) return res.value.data;
      return [];
    },
  });

useEffect(() => {
  const value = limitOptions?.defaultProtocol;
  if (value !== undefined && state.selectedProtocol.isTouched === false && state.selectedProtocol.value !== value) {

    action({ type: 'ProtocolChanged', value });
  } else {
    const current = limitOptions?.options.find(p => p.protocol === state.selectedProtocol.value);
    if (current === undefined) {
      action({ type: 'ProtocolChanged', value });
    }
  }

  const wantedPrice = limitOptions?.wantedPrice;
  action({ type: 'WantedPriceInputChanged', value: String(wantedPrice) });
}, [
  limitOptions?.defaultProtocol,
  limitOptions?.options,
  limitOptions?.wantedPrice,
  state.selectedProtocol.isTouched,
  state.selectedProtocol.value,
]);

  useEffect(() => {
    const normalizeId = (id?: string | null) => (id === '.' ? '' : id);

    const tokenAmount = ftAssetList.find(asset => asset.info.id === normalizeId(state.tokenInInput.tokenId));

    const hasEnoughBalance = Number(tokenAmount?.formatedAmount) >= Number(state.tokenInInput.value);

    if (!hasEnoughBalance) {
      action({ type: 'TokenInErrorChanged', value: 'Not enogh balance' });
    } else {
      action({ type: 'TokenInErrorChanged', value: null });
    }
  }, [ftAssetList, state.tokenInInput.tokenId, state.tokenInInput.value]);

  useEffect(() => {
    if (!state.needsNewEstimate) return;
    action({ type: SwapAction.EstimateError, value: { message: '', status: 0, responseData: null } });

    if (
      state.tokenInInput.tokenId === undefined ||
      state.tokenOutInput.tokenId === undefined ||
      (state.tokenInInput.value === '' && state.tokenOutInput.value === '')
    )
      return;
    setIsEstimateOrderLoading(true);

    swapManager.api
      .estimate({
        slippage: state.slippageInput.value,
        tokenIn: state.tokenInInput.tokenId,
        tokenOut: state.tokenOutInput.tokenId,
        ...(state.lastInputTouched === ASSET_DIRECTION_IN
          ? {
              amountIn: Number(state.tokenInInput.value),
              ...(state.orderType === 'limit' && {
                wantedPrice: Number(state.wantedPrice),
              }),
            }
          : {
              amountOut: Number(state.tokenOutInput.value),
            }),
        blockedProtocols: [],
        protocol: state.selectedProtocol.value,
      })
      .then(response => {
        if (isLeft(response)) {
          action({ type: SwapAction.EstimateError, value: response.error });
        } else {
          action({ type: SwapAction.EstimateResponse, value: response.value.data });
        }
      })
      .finally(() => {
        setIsEstimateOrderLoading(false);
      });
  }, [state, swapManager.api]);

  const create = useCallback(async () => {
    if (state.tokenInInput.tokenId === undefined || state.tokenOutInput.tokenId === undefined) return;

    setIsCreateOrderLoading(true);

    const tokenInInfo = tokenInfos.get(state.tokenInInput.tokenId);
    const quantityIn =
      Number(state.tokenInInput.value) *
      10 ** (state.tokenInInput.tokenId === '.' ? primaryTokenInfo.decimals : tokenInInfo?.decimals);
    const amountsIn = { [state.tokenInInput.tokenId]: String(quantityIn) };
    const inputs = await getInputs(amountsIn);

    swapManager.api
      .create({
        tokenIn: state.tokenInInput.tokenId,
        tokenOut: state.tokenOutInput.tokenId,
        amountIn: Number(state.tokenInInput.value),
        ...(state.orderType === 'limit' ? { wantedPrice: Number(state.wantedPrice) } : { slippage: state.slippageInput.value }),
        blockedProtocols: [],
        protocol: state.selectedProtocol.value,
        inputs,
      })
      .then(response => {
        setIsCreateOrderLoading(false);
        if (isLeft(response)) {
          action({ type: SwapAction.CreateError, value: response.error });
        } else {
          action({ type: SwapAction.CreateResponse, value: response.value.data });
        }
      });
  }, [
    state.estimate?.splits,
    state.estimate?.totalFee,
    state.orderType,
    state.selectedProtocol.value,
    state.slippageInput.value,
    state.tokenInInput.tokenId,
    state.tokenInInput.value,
    state.tokenOutInput.tokenId,
    state.tokenOutInput.value,
    state.wantedPrice,
    swapManager.api,
    tokenInfos,
  ]);

  const context: any = useMemo(
    () => ({
      swapForm: { action, orders, refetchOrders, ...state },
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
      createOrder: create,
      isCreateOrderLoading,
      isLimitOptionsLoading,
      isEstimateOrderLoading,
      limitOptions,
      swapManager,
      stores,
    }),
    [state.tokenInInput, state.tokenOutInput, action, tokenInfos, orders, refetchOrders]
  );

  if (!selectedWallet) return null;

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>;
};

export const useSwapRevamp = () =>
  useContext(SwapContext) ?? console.log('useSwapRevamp: needs to be wrapped in a SwapContextProvider');

const swapReducer = (state: SwapState, action: SwapAction) => {
  return produce(state, draft => {
    draft.needsNewEstimate = true;
    draft.lastInputTouched = ASSET_DIRECTION_IN;

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
        Object.assign(draft, defaultState);
        break;

      case SwapAction.EstimateResponse:
        draft.lastInputTouched = state.lastInputTouched;
        draft.needsNewEstimate = false;
        draft.estimate = action.value;
        draft.tokenOutInput.error = null;
        draft.canSwap = true;

        if (state.lastInputTouched === ASSET_DIRECTION_IN) {
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
  lastInputTouched: ASSET_DIRECTION_IN,
  tokenInInput: {
    isTouched: true,
    tokenId: primaryTokenId,
    disabled: false,
    error: null,
    value: '',
  },
  tokenOutInput: {
    isTouched: true,
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
  orderType: MarketOrderType;
  lastInputTouched: AssetDirectionType;
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
  createOrder: () => void;
  cancel: Swap.Api['cancel'];
  managerSettings: Swap.ManagerSettings;
  assignManagerSettings: Swap.Manager['assignSettings'];
  refetchOrders: () => void;
  ftAssetList: any;
  tokenInfoList: any;
  swapForm: any;
  stores: any;
  primaryTokenInfo: any;
  loadingTokenList: boolean;
  isCreateOrderLoading: boolean;
  isEstimateOrderLoading: boolean;
  isLimitOptionsLoading: boolean;
  explorer: { tokenInfo: { name: string; baseUrl: string } };
  swapManager: any;
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
  createOrder: () => new Promise(res => res),
  cancel: () => new Promise(res => res),
  managerSettings: { routingPreference: 'auto', slippage: 1 },
  assignManagerSettings: () => ({ routingPreference: 'auto', slippage: 1 }),
  refetchOrders: () => null,
  ftAssetList: [],
  tokenInfoList: [],
  swapForm: {},
  stores: undefined,
  primaryTokenInfo: {},
  loadingTokenList: false,
  isCreateOrderLoading: false,
  isEstimateOrderLoading: false,
  isLimitOptionsLoading: false,
  explorer: { tokenInfo: { name: '', baseUrl: '' } },
  swapManager: {},
});

const parseNumber = (text: string) =>
  !Number.isNaN(Number(text.replace(',', '.')))
    ? text
        .replace(',', '.')
        .replace(/^0+(.+)/, '$1')
        .replace(/^\.$/, '0.')
    : '0';

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
import { toBaseUnits, useGetInputs } from '../common/helpers';
import { ASSET_DIRECTION_IN, USDA_TOKEN_ID } from '../common/constants';
import { useStrings } from '../common/hooks/useStrings';

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
  const strings = useStrings();

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

  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ['useSwapOrders', stakingKey, swapManager.settings.routingPreference],
    queryFn: async () => {
      const res = await swapManager.api.orders();
      if (isRight(res)) return res.value.data;
      return [];
    },
  });

  const {
    data: { tokenInfos = new Map(), tokenInfoList = [] } = {},
    isLoading: loadingTokenList,
    refetch: refetchTokenList,
  } = useSyncedTokenInfos({
    swapManager,
    tokenManager,
    primaryTokenInfo,
    networkId: Chain.Network.Mainnet,
    excludedTokens: excludedTokens,
  });

  useEffect(() => {
    refetchTokenList();
  }, []);

  useEffect(() => {
    if (tokenOutId) {
      action({ type: SwapActionType.TokenOutIdChanged, value: tokenOutId as Portfolio.Token.Id });
    }
  }, [tokenOutId]);

  useEffect(() => {
    action({ type: 'SlippageInputChanged', value: swapManager.settings.slippage });
  }, [swapManager.settings.slippage]);

  const estimateReqIdRef = useRef(0);

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

  useEffect(() => {
    const value = limitOptions?.defaultProtocol;
    if (value !== undefined && state.selectedProtocol.isTouched === false && state.selectedProtocol.value !== value) {
      action({ type: SwapActionType.ProtocolChanged, value });
    } else {
      const current = limitOptions?.options.find(p => p.protocol === state.selectedProtocol.value);
      if (current === undefined) {
        action({ type: SwapActionType.ProtocolChanged, value });
      }
    }

    const wantedPrice = limitOptions?.wantedPrice;
    if (wantedPrice !== undefined && wantedPrice > 0 && state.selectedProtocol.value === limitOptions?.defaultProtocol)
      action({ type: 'WantedPriceInputChanged', value: String(wantedPrice) });
  }, [
    limitOptions?.defaultProtocol,
    limitOptions?.options,
    limitOptions?.wantedPrice,
    state.selectedProtocol.isTouched,
    state.selectedProtocol.value,
  ]);

  useEffect(() => {
    const normalizeId = (id?: string | null) => (id === '.' ? '' : (id ?? ''));

    const asset = ftAssetList.find(a => a.info.id === normalizeId(state.tokenInInput.tokenId));
    const balance = asset ? BigInt(asset.quantity) : BigInt(0);
    const decimals = asset?.info.numberOfDecimals ?? 0;
    const needed = toBaseUnits(state.tokenInInput.value, decimals);

    const error = asset && needed !== null && balance < needed ? strings.notEnoughBalance : null;

    action({ type: 'TokenInErrorChanged', value: error });
  }, [ftAssetList, state.tokenInInput.tokenId, state.tokenInInput.value]);

  useEffect(() => {
    if (!state.needsNewEstimate) return;
    action({ type: SwapActionType.EstimateError, value: { message: '', status: 0, responseData: null } });

    if (
      state.tokenInInput.tokenId === undefined ||
      state.tokenOutInput.tokenId === undefined ||
      (state.tokenInInput.value === '' && state.tokenOutInput.value === '')
    )
      return;
    setIsEstimateOrderLoading(true);
    const reqId = ++estimateReqIdRef.current;

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
        if (reqId !== estimateReqIdRef.current) return;
        if (isLeft(response)) {
          action({ type: SwapActionType.EstimateError, value: response.error });
        } else {
          action({ type: SwapActionType.EstimateResponse, value: response.value.data });
        }
      })
      .catch(() => {
        if (reqId !== estimateReqIdRef.current) return;
        action({
          type: SwapActionType.EstimateError,
          value: {
            status: -1,
            message: 'Failed to estimate swap. Please try again.',
            responseData: {},
          },
        });
      })
      .finally(() => {
        setIsEstimateOrderLoading(false);
      });
  }, [
    state.needsNewEstimate,
    state.tokenInInput.tokenId,
    state.tokenOutInput.tokenId,
    state.tokenInInput.value,
    state.tokenOutInput.value,
    state.slippageInput.value,
    state.lastInputTouched,
    state.orderType,
    state.wantedPrice,
    state.selectedProtocol.value,
    swapManager.api,
    action,
  ]);

  const create = useCallback(async () => {
    if (state.tokenInInput.tokenId === undefined || state.tokenOutInput.tokenId === undefined) return;
    setIsCreateOrderLoading(true);
    const inputs = await getInputs();

    swapManager.api
      .create({
        tokenIn: state.tokenInInput.tokenId,
        tokenOut: state.tokenOutInput.tokenId,
        amountIn: Number(state.tokenInInput.value),
        ...(state.orderType === 'limit' ? { wantedPrice: Number(state.wantedPrice) } : { slippage: state.slippageInput.value }),
        blockedProtocols: [],
        protocol: state.selectedProtocol.value,
        inputs: inputs,
      })
      .then(response => {
        setIsCreateOrderLoading(false);
        action({ type: SwapActionType.SwapReviewSelected, value: false });

        if (isLeft(response)) {
          action({ type: SwapActionType.CreateError, value: response.error });
        } else {
          action({ type: SwapActionType.CreateResponse, value: response.value.data });
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

  const swapForm = useMemo(
    () => ({
      action,
      orders,
      refetchOrders,
      ...state,
    }),
    [action, orders, refetchOrders, state]
  );

  const context: any = useMemo(
    () => ({
      swapForm,
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

export const swapReducer = (state: SwapState, action: SwapAction) => {
  return produce(state, draft => {
    draft.needsNewEstimate = true;
    draft.lastInputTouched = ASSET_DIRECTION_IN;

    switch (action.type) {
      case SwapActionType.ChangeOrderType:
        draft.needsNewEstimate = true;
        draft.lastInputTouched = 'in';
        draft.orderType = action.value;
        break;

      case SwapActionType.TokenInInputTouched:
        draft.needsNewEstimate = true;
        draft.lastInputTouched = 'in';
        draft.tokenInInput.isTouched = true;
        draft.tokenInInput.value = '';
        draft.tokenInInput.error = null;
        break;

      case SwapActionType.TokenOutInputTouched:
        draft.needsNewEstimate = true;
        draft.lastInputTouched = 'in';
        draft.tokenOutInput.isTouched = true;
        draft.tokenOutInput.value = '';
        draft.tokenOutInput.error = null;
        break;

      case SwapActionType.TokenInIdChanged:
        draft.needsNewEstimate = true;
        draft.lastInputTouched = 'in';
        draft.tokenInInput.tokenId = action.value;
        draft.selectedProtocol.isTouched = false;
        draft.wantedPrice = '';
        break;

      case SwapActionType.TokenOutIdChanged:
        draft.needsNewEstimate = true;
        draft.lastInputTouched = 'in';
        draft.tokenOutInput.tokenId = action.value;
        draft.selectedProtocol.isTouched = false;
        draft.wantedPrice = '';
        break;

      case SwapActionType.TokenInAmountChanged:
        draft.needsNewEstimate = true;
        draft.lastInputTouched = 'in';
        draft.tokenInInput.value = parseNumber(action.value);
        if (action.value === '' || action.value === '0') {
          draft.tokenOutInput.value = '0';
          draft.estimate = undefined;
          draft.needsNewEstimate = false;
        }
        break;

      case SwapActionType.TokenOutAmountChanged:
        draft.needsNewEstimate = true;
        draft.lastInputTouched = 'out';
        draft.tokenOutInput.value = parseNumber(action.value);
        if (action.value === '' || action.value === '0') {
          draft.tokenInInput.value = '0';
          draft.estimate = undefined;
          draft.needsNewEstimate = false;
        }
        break;

      case SwapActionType.TokenInErrorChanged:
        draft.needsNewEstimate = false;
        draft.lastInputTouched = state.lastInputTouched;
        draft.tokenInInput.error = action.value;
        if (action.value !== null) {
          draft.canSwap = false;
        }
        break;

      case SwapActionType.TokenOutErrorChanged:
        draft.needsNewEstimate = false;
        draft.lastInputTouched = state.lastInputTouched;
        draft.tokenOutInput.error = action.value;
        if (action.value !== null) {
          draft.canSwap = false;
        }
        break;

      case SwapActionType.SlippageInputChanged:
        draft.needsNewEstimate = true;
        draft.lastInputTouched = 'in';
        draft.slippageInput.value = action.value;
        break;

      case SwapActionType.WantedPriceInputChanged:
        draft.needsNewEstimate = true;
        draft.lastInputTouched = 'in';
        draft.wantedPrice = parseNumber(action.value);
        if (Number(draft.wantedPrice) === 0) draft.needsNewEstimate = false;
        break;

      case SwapActionType.SwitchTouched:
        draft.needsNewEstimate = true;
        draft.lastInputTouched = 'in';
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

      case SwapActionType.ProtocolSelected:
        draft.needsNewEstimate = true;
        draft.lastInputTouched = 'in';
        draft.selectedProtocol.isTouched = true;
        draft.selectedProtocol.value = action.value;
        break;

      case SwapActionType.ProtocolChanged:
        draft.needsNewEstimate = true;
        draft.lastInputTouched = 'in';
        draft.selectedProtocol.isTouched = false;
        draft.selectedProtocol.value = action.value;
        break;

      case SwapActionType.Refresh:
        draft.needsNewEstimate = true;
        draft.lastInputTouched = state.lastInputTouched;
        draft.tokenInInput.error = null;
        draft.tokenOutInput.error = null;
        draft.canSwap = false;
        break;

      case SwapActionType.ResetAmounts:
        draft.needsNewEstimate = true;
        draft.lastInputTouched = 'in';
        draft.tokenInInput.value = '';
        draft.tokenOutInput.value = '';

        draft.tokenInInput.error = null;
        draft.tokenOutInput.error = null;
        draft.canSwap = false;
        break;

      case SwapActionType.ResetForm:
        Object.assign(draft, defaultState);
        break;

      case SwapActionType.EstimateResponse:
        draft.needsNewEstimate = false;
        draft.lastInputTouched = state.lastInputTouched;
        draft.estimate = action.value;
        draft.tokenOutInput.error = null;
        // Only enable swap if there are no input errors
        draft.canSwap = state.tokenInInput.error === null;

        if (state.lastInputTouched === 'in') {
          draft.tokenOutInput.value = String(action.value.totalOutputWithoutSlippage ?? 0);
        } else {
          draft.tokenInInput.value = String(action.value.totalInput ?? 0);
        }
        break;

      case SwapActionType.EstimateError:
        draft.needsNewEstimate = false;
        draft.lastInputTouched = 'in';
        draft.estimate = undefined;
        draft.tokenOutInput.error = action.value.message;
        draft.canSwap = false;
        break;

      case SwapActionType.CreateResponse:
        draft.needsNewEstimate = false;
        draft.lastInputTouched = 'in';
        draft.createTx = action.value;
        break;

      case SwapActionType.CreateError:
        draft.needsNewEstimate = false;
        draft.lastInputTouched = 'in';
        draft.createTx = undefined;
        draft.tokenOutInput.error = action.value.message;
        draft.canSwap = false;
        break;

      case SwapActionType.SwapReviewSelected:
        draft.reviewSwapSelected = action.value;
        break;

      default:
        throw new Error(`swapReducer invalid action`);
    }
  });
};

export const SwapActionType = {
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
  SwapReviewSelected: 'SwapReviewSelected',
} as const;

type SwapAction =
  | { type: typeof SwapActionType.ChangeOrderType; value: 'limit' | 'market' }
  | { type: typeof SwapActionType.TokenInInputTouched }
  | { type: typeof SwapActionType.TokenOutInputTouched }
  | { type: typeof SwapActionType.TokenInIdChanged; value: Portfolio.Token.Id }
  | { type: typeof SwapActionType.TokenOutIdChanged; value: Portfolio.Token.Id }
  | { type: typeof SwapActionType.TokenInAmountChanged; value: string }
  | { type: typeof SwapActionType.TokenOutAmountChanged; value: string }
  | { type: typeof SwapActionType.TokenInErrorChanged; value: string | null }
  | { type: typeof SwapActionType.TokenOutErrorChanged; value: string | null }
  | { type: typeof SwapActionType.WantedPriceInputChanged; value: string }
  | { type: typeof SwapActionType.SlippageInputChanged; value: number }
  | { type: typeof SwapActionType.SwitchTouched }
  | { type: typeof SwapActionType.ProtocolSelected; value: Swap.Protocol }
  | {
      type: typeof SwapActionType.ProtocolChanged;
      value: Swap.Protocol | undefined;
    }
  | { type: typeof SwapActionType.Refresh }
  | { type: typeof SwapActionType.ResetAmounts }
  | { type: typeof SwapActionType.ResetForm }
  | { type: typeof SwapActionType.EstimateResponse; value: Swap.EstimateResponse }
  | { type: typeof SwapActionType.EstimateError; value: Api.ResponseError }
  | { type: typeof SwapActionType.CreateResponse; value: Swap.CreateResponse }
  | { type: typeof SwapActionType.CreateError; value: Api.ResponseError }
  | { type: typeof SwapActionType.SwapReviewSelected; value: boolean };

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
  reviewSwapSelected: boolean;
  estimate?: Swap.EstimateResponse;
  createTx?: Swap.CreateResponse;
};

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
    tokenId: USDA_TOKEN_ID,
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
  reviewSwapSelected: false,
  estimate: undefined,
  createTx: undefined,
  cancelTx: undefined,
  cancelError: undefined,
} as const);

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
  reviewSwapSelected: boolean;
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
  reviewSwapSelected: false,
});

const parseNumber = (text: string) =>
  !Number.isNaN(Number(text.replace(',', '.')))
    ? text
        .replace(',', '.')
        .replace(/^0+(?=\d|\.)/, '0')
        .replace(/^\.$/, '0.')
    : '0';

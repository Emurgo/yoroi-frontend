// @flow
import type { ComponentType, Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { LayoutComponentMap } from '../../../styles/context/layout';
import type { ConfigType } from '../../../../config/config-types';
import type { TxRequests } from '../../../stores/toplevel/TransactionsStore';
import type { DelegationRequests, PoolMeta } from '../../../stores/toplevel/DelegationStore';
import type { GeneratedData as UnmangleTxDialogContainerData } from '../../transfer/UnmangleTxDialogContainer';
import type { GeneratedData as DeregisterDialogContainerData } from '../../transfer/DeregisterDialogContainer';
import type { TokenInfoMap } from '../../../stores/toplevel/TokenInfoStore';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import type { AdaDelegationRequests } from '../../../stores/ada/AdaDelegationStore';
import type { GeneratedData as WithdrawalTxDialogContainerData } from '../../transfer/WithdrawalTxDialogContainer';
import type { PoolRequest } from '../../../api/jormungandr/lib/storage/bridge/delegationUtils';
import type { TokenEntry } from '../../../api/common/lib/MultiToken';
import type {
  CurrentTimeRequests,
  TimeCalcRequests,
} from '../../../stores/base/BaseCardanoTimeStore';

import { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import moment from 'moment';

import globalMessages from '../../../i18n/global-messages';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import { withLayout } from '../../../styles/context/layout';
import WalletEmptyBanner from '../WalletEmptyBanner';
import BuySellDialog from '../../../components/buySell/BuySellDialog';
import { Box, styled } from '@mui/system';
import LocalizableError from '../../../i18n/LocalizableError';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { genLookupOrFail } from '../../../stores/stateless/tokenHelpers';
import UnmangleTxDialogContainer from '../../transfer/UnmangleTxDialogContainer';
import DeregisterDialogContainer from '../../transfer/DeregisterDialogContainer';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import WithdrawalTxDialogContainer from '../../transfer/WithdrawalTxDialogContainer';
import { generateGraphData } from '../../../utils/graph';
import { ApiOptions, getApiForNetwork } from '../../../api/common/utils';

export type GeneratedData = typeof SwapPageContent.prototype.generated;
// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  actions: any,
  stores: any,
|};
type InjectedProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};

type AllProps = {| ...Props, ...InjectedProps |};
@observer
class SwapPageContent extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  async componentDidMount() {
    const timeStore = this.generated.stores.time;
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(SwapPageContent)} no public deriver. Should never happen`);
    }
    const timeCalcRequests = timeStore.getTimeCalcRequests(publicDeriver);
    await timeCalcRequests.requests.toAbsoluteSlot.execute().promise;
    await timeCalcRequests.requests.toRealTime.execute().promise;
    await timeCalcRequests.requests.currentEpochLength.execute().promise;
    await timeCalcRequests.requests.currentSlotLength.execute().promise;
    await timeCalcRequests.requests.timeSinceGenesis.execute().promise;
  }

  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(SwapPageContent)} no public deriver. Should never happen`);
    }
    const { stores } = this.generated;
    const { uiDialogs, delegation: delegationStore } = stores;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(SwapPageContent)} opened for non-reward wallet`);
    }
    const txRequests = stores.transactions.getTxRequests(publicDeriver);
    const balance = txRequests.requests.getBalanceRequest.result;
    const isWalletWithNoFunds = balance != null && balance.getDefaultEntry().amount.isZero();
    console.log('🚀 > isWalletWithNoFunds:', isWalletWithNoFunds);

    return <Box>swap page</Box>;
  }

  @computed get generated(): {|
    DeregisterDialogContainerProps: InjectedOrGenerated<DeregisterDialogContainerData>,
    UnmangleTxDialogContainerProps: InjectedOrGenerated<UnmangleTxDialogContainerData>,
    WithdrawalTxDialogContainerProps: InjectedOrGenerated<WithdrawalTxDialogContainerData>,
    actions: {|
      ada: {|
        delegationTransaction: {|
          reset: {| trigger: (params: {| justTransaction: boolean |}) => void |},
          createWithdrawalTxForWallet: {|
            trigger: (params: {| publicDeriver: PublicDeriver<> |}) => Promise<void>,
          |},
        |},
      |},
      jormungandr: {|
        delegationTransaction: {|
          createTransaction: {|
            trigger: (params: {|
              poolRequest: PoolRequest,
              publicDeriver: PublicDeriver<>,
            |}) => Promise<void>,
          |},
        |},
      |},
      dialogs: {|
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any,
          |}) => void,
        |},
        closeActiveDialog: {|
          trigger: (params: void) => void,
        |},
      |},
      transactions: {|
        closeDelegationBanner: {|
          trigger: (params: void) => void,
        |},
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string,
          |}) => void,
        |},
      |},
    |},
    stores: {|
      uiDialogs: {|
        getParam: <T>(number | string) => T,
        isOpen: any => boolean,
      |},
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?string,
      |},
      substores: {|
        ada: {|
          delegation: {|
            getDelegationRequests: (PublicDeriver<>) => void | AdaDelegationRequests,
          |},
        |},
      |},
      delegation: {|
        selectedPage: number,
        getLocalPoolInfo: ($ReadOnly<NetworkRow>, string) => void | PoolMeta,
        getDelegationRequests: (PublicDeriver<>) => void | DelegationRequests,
      |},
      profile: {|
        shouldHideBalance: boolean,
        unitOfAccount: UnitOfAccountSettingType,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
      |},
      wallets: {| selected: null | PublicDeriver<> |},
      transactions: {|
        showDelegationBanner: boolean,
        getTxRequests: (PublicDeriver<>) => TxRequests,
      |},
      time: {|
        getCurrentTimeRequests: (PublicDeriver<>) => CurrentTimeRequests,
        getTimeCalcRequests: (PublicDeriver<>) => TimeCalcRequests,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SwapPageContent)} no way to generated props`);
    }
    const { stores, actions } = this.props;

    const selected = stores.wallets.selected;
    if (selected == null) {
      throw new Error(`${nameof(EpochProgressContainer)} no wallet selected`);
    }
    const api = getApiForNetwork(selected.getParent().getNetworkInfo());
    const time = (() => {
      if (api === ApiOptions.ada) {
        return {
          getTimeCalcRequests: stores.substores.ada.time.getTimeCalcRequests,
          getCurrentTimeRequests: stores.substores.ada.time.getCurrentTimeRequests,
        };
      }
      if (api === ApiOptions.jormungandr) {
        return {
          getTimeCalcRequests: stores.substores.jormungandr.time.getTimeCalcRequests,
          getCurrentTimeRequests: stores.substores.jormungandr.time.getCurrentTimeRequests,
        };
      }
      return {
        getTimeCalcRequests: (undefined: any),
        getCurrentTimeRequests: () => {
          throw new Error(`${nameof(SwapPageContent)} api not supported`);
        },
      };
    })();
    return Object.freeze({
      stores: {
        wallets: {
          selected: stores.wallets.selected,
        },
        profile: {
          shouldHideBalance: stores.profile.shouldHideBalance,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        delegation: {
          selectedPage: stores.delegation.selectedPage,
          getLocalPoolInfo: stores.delegation.getLocalPoolInfo,
          getDelegationRequests: stores.delegation.getDelegationRequests,
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
        transactions: {
          showDelegationBanner: stores.transactions.showDelegationBanner,
          getTxRequests: stores.transactions.getTxRequests,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
        substores: {
          ada: {
            delegation: {
              getDelegationRequests: stores.substores.ada.delegation.getDelegationRequests,
            },
          },
        },
        time,
      },
      actions: {
        ada: {
          delegationTransaction: {
            reset: {
              trigger: actions.ada.delegationTransaction.reset.trigger,
            },
            createWithdrawalTxForWallet: {
              trigger: actions.ada.delegationTransaction.createWithdrawalTxForWallet.trigger,
            },
          },
        },
        jormungandr: {
          delegationTransaction: {
            createTransaction: {
              trigger: actions.jormungandr.delegationTransaction.createTransaction.trigger,
            },
          },
        },
        transactions: {
          closeDelegationBanner: {
            trigger: actions.transactions.closeDelegationBanner.trigger,
          },
        },
        dialogs: {
          open: {
            trigger: actions.dialogs.open.trigger,
          },
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
      UnmangleTxDialogContainerProps: ({
        stores,
        actions,
      }: InjectedOrGenerated<UnmangleTxDialogContainerData>),
      WithdrawalTxDialogContainerProps: ({
        stores,
        actions,
      }: InjectedOrGenerated<WithdrawalTxDialogContainerData>),
      DeregisterDialogContainerProps: ({
        stores,
        actions,
      }: InjectedOrGenerated<DeregisterDialogContainerData>),
    });
  }
}
export default (withLayout(SwapPageContent): ComponentType<Props>);

const WrapperCards = styled(Box)({
  display: 'flex',
  gap: '40px',
  justifyContent: 'space-between',
  marginBottom: '40px',
  height: '556px',
});

const RightCardsWrapper = styled(Box)({
  display: 'flex',
  flex: '1 1 48.5%',
  maxWidth: '48.5%',
  flexDirection: 'column',
  gap: '40px',
});

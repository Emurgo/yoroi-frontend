// @flow
import moment from 'moment';
import { computed } from 'mobx';
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../types/injectedPropsType';
import { intlShape } from 'react-intl';
import NavBar from '../components/topbar/NavBar';
import NavPlate from '../components/topbar/NavPlate';
import NavWalletDetails from '../components/topbar/NavWalletDetails';
import NoWalletsDropdown from '../components/topbar/NoWalletsDropdown';
import NavDropdown from '../components/topbar/NavDropdown';
import NavDropdownRow from '../components/topbar/NavDropdownRow';
import { ROUTES } from '../routes-config';
import { ConceptualWallet } from '../api/ada/lib/storage/models/ConceptualWallet/index';
import { asGetPublicKey } from '../api/ada/lib/storage/models/PublicDeriver/traits';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { DelegationRequests } from '../stores/toplevel/DelegationStore';
import type { ConceptualWalletSettingsCache } from '../stores/toplevel/WalletSettingsStore';
import type { PublicKeyCache } from '../stores/toplevel/WalletStore';
import type { TxRequests } from '../stores/toplevel/TransactionsStore';
import type { IGetPublic } from '../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { TokenRow } from '../api/ada/lib/storage/database/primitives/tables';
import { MultiToken } from '../api/common/lib/MultiToken';
import type { TokenInfoMap } from '../stores/toplevel/TokenInfoStore';
import { genLookupOrFail } from '../stores/stateless/tokenHelpers';
import BuySellDialog from '../components/buySell/BuySellDialog';
import globalMessages from '../i18n/global-messages';

export type GeneratedData = typeof NavBarContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  title: Node,
|};

@observer
export default class NavBarContainer extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  updateHideBalance: void => Promise<void> = async () => {
    await this.generated.actions.profile.updateHideBalance.trigger();
  };

  switchToNewWallet: (PublicDeriver<>) => void = newWallet => {
    this.generated.actions.router.goToRoute.trigger({
      route: this.generated.stores.app.currentRoute,
      publicDeriver: newWallet,
    });
  };

  openDialogWrapper: any => void = dialog => {
    this.generated.actions.router.goToRoute.trigger({ route: ROUTES.MY_WALLETS });
    this.generated.actions.dialogs.open.trigger({ dialog });
  };

  render(): Node {
    const { intl } = this.context;
    const { stores } = this.generated;
    const { profile } = stores;

    const walletsStore = stores.wallets;

    const wallets = this.generated.stores.wallets.publicDerivers;

    const walletComponents = wallets.map(wallet => {
      const txRequests = this.generated.stores.transactions.getTxRequests(wallet);
      const balance = txRequests.requests.getBalanceRequest.result || null;

      const parent = wallet.getParent();
      const settingsCache = this.generated.stores.walletSettings.getConceptualWalletSettingsCache(
        parent
      );

      const withPubKey = asGetPublicKey(wallet);
      const plate =
        withPubKey == null
          ? null
          : this.generated.stores.wallets.getPublicKeyCache(withPubKey).plate;

      return (
        <NavDropdownRow
          key={wallet.getPublicDeriverId()}
          plateComponent={<NavPlate plate={plate} wallet={settingsCache} />}
          onSelect={() => this.switchToNewWallet(wallet)}
          isCurrentWallet={wallet === this.generated.stores.wallets.selected}
          syncTime={
            txRequests.lastSyncInfo.Time ? moment(txRequests.lastSyncInfo.Time).fromNow() : null
          }
          detailComponent={
            <NavWalletDetails
              walletAmount={balance}
              onUpdateHideBalance={this.updateHideBalance}
              shouldHideBalance={profile.shouldHideBalance}
              rewards={this.getRewardBalance(wallet)}
              getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
              defaultToken={this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
                wallet.getParent().getNetworkInfo().NetworkId
              )}
              showEyeIcon={false}
              purpose='allWallets'
            />
          }
        />
      );
    });
    const dropdownContent = (
      <>
        <NavDropdownRow
          title={intl.formatMessage(globalMessages.allWalletsLabel)}
          detailComponent={undefined}
        />
        {walletComponents}
      </>
    );

    const dropdownComponent = (() => {
      const getDropdownHead = () => {
        const publicDeriver = walletsStore.selected;
        if (publicDeriver == null) {
          return <NoWalletsDropdown />;
        }

        const txRequests = this.generated.stores.transactions.getTxRequests(publicDeriver);
        const balance = txRequests.requests.getBalanceRequest.result || null;

        return (
          <NavWalletDetails
            onUpdateHideBalance={this.updateHideBalance}
            shouldHideBalance={profile.shouldHideBalance}
            rewards={this.getRewardBalance(publicDeriver)}
            walletAmount={balance}
            getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
            defaultToken={this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
              publicDeriver.getParent().getNetworkInfo().NetworkId
            )}
            purpose='topBar'
          />
        );
      };

      return (
        <NavDropdown
          headerComponent={getDropdownHead()}
          contentComponents={dropdownContent}
          onAddWallet={() =>
            this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD })
          }
          openBuySellDialog={() => this.openDialogWrapper(BuySellDialog)}
        />
      );
    })();

    const getPlate = () => {
      const publicDeriver = walletsStore.selected;
      if (publicDeriver == null) return null;

      const parent = publicDeriver.getParent();

      const settingsCache = this.generated.stores.walletSettings.getConceptualWalletSettingsCache(
        parent
      );

      const withPubKey = asGetPublicKey(publicDeriver);
      const plate =
        withPubKey == null
          ? null
          : this.generated.stores.wallets.getPublicKeyCache(withPubKey).plate;

      return <NavPlate plate={plate} wallet={settingsCache} />;
    };

    return (
      <NavBar title={this.props.title} walletPlate={getPlate()} walletDetails={dropdownComponent} />
    );
  }

  /**
   * undefined => wallet is not a reward wallet
   * null => still calculating
   * value => done calculating
   */
  getRewardBalance: (PublicDeriver<>) => null | void | MultiToken = publicDeriver => {
    const delegationRequest = this.generated.stores.delegation.getDelegationRequests(publicDeriver);
    if (delegationRequest == null) return undefined;

    const balanceResult = delegationRequest.getDelegatedBalance.result;
    if (balanceResult == null) {
      return null;
    }
    return balanceResult.accountPart;
  };

  @computed get generated(): {|
    actions: {|
      dialogs: {|
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any,
          |}) => void,
        |},
      |},
      profile: {|
        updateHideBalance: {|
          trigger: (params: void) => Promise<void>,
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
      wallets: {|
        setActiveWallet: {|
          trigger: (params: {|
            wallet: PublicDeriver<>,
          |}) => void,
        |},
      |},
    |},
    stores: {|
      app: {| currentRoute: string |},
      delegation: {|
        getDelegationRequests: (PublicDeriver<>) => void | DelegationRequests,
      |},
      profile: {|
        shouldHideBalance: boolean,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
        getDefaultTokenInfo: number => $ReadOnly<TokenRow>,
      |},
      transactions: {|
        getTxRequests: (PublicDeriver<>) => TxRequests,
      |},
      walletSettings: {|
        getConceptualWalletSettingsCache: ConceptualWallet => ConceptualWalletSettingsCache,
      |},
      wallets: {|
        getPublicKeyCache: IGetPublic => PublicKeyCache,
        publicDerivers: Array<PublicDeriver<>>,
        selected: null | PublicDeriver<>,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(NavBarContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        app: {
          currentRoute: stores.app.currentRoute,
        },
        walletSettings: {
          getConceptualWalletSettingsCache: stores.walletSettings.getConceptualWalletSettingsCache,
        },
        wallets: {
          selected: stores.wallets.selected,
          publicDerivers: stores.wallets.publicDerivers,
          getPublicKeyCache: stores.wallets.getPublicKeyCache,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
          getDefaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfo,
        },
        profile: {
          shouldHideBalance: stores.profile.shouldHideBalance,
        },
        delegation: {
          getDelegationRequests: stores.delegation.getDelegationRequests,
        },
        transactions: {
          getTxRequests: stores.transactions.getTxRequests,
        },
      },
      actions: {
        wallets: {
          setActiveWallet: { trigger: actions.wallets.setActiveWallet.trigger },
        },
        profile: {
          updateHideBalance: { trigger: actions.profile.updateHideBalance.trigger },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
        dialogs: {
          open: { trigger: actions.dialogs.open.trigger },
        },
      },
    });
  }
}

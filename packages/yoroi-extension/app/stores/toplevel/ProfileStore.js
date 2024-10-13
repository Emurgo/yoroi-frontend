// @flow
import { action, computed, observable, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
import BaseProfileStore from '../base/BaseProfileStore';
import Request from '../lib/LocalizedRequest';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { StoresMap } from '../index';
import { ComplexityLevels } from '../../types/complexityLevelType';
import type { WalletsNavigation } from '../../api/localStorage'
import { ampli } from '../../../ampli/index';
import { subscribe } from '../../api/thunk';
import { noop } from '../../coreUtils';

export default class ProfileStore extends BaseProfileStore<StoresMap> {
  @observable __selectedNetwork: void | $ReadOnly<NetworkRow> = undefined;

  /**
   * We only want to redirect users once when the app launches
   */
  @observable
  hasRedirected: boolean = false;

  /** Linear list of steps that need to be completed before app start */
  @observable
  SETUP_STEPS: Array<{| isDone: void => boolean | Promise<boolean>, action: void => Promise<void> |}> = [
    {
      isDone: () => this.isCurrentLocaleSet,
      action: async () => {
        const route = ROUTES.PROFILE.LANGUAGE_SELECTION;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.stores.app.goToRoute({ route });
        ampli.createWalletLanguagePageViewed();
      },
    },
    {
      isDone: () => this.areTermsOfUseAccepted,
      action: async () => {
        const route = ROUTES.PROFILE.TERMS_OF_USE;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.stores.app.goToRoute({ route });
        ampli.createWalletTermsPageViewed();
      },
    },
    {
      isDone: () => this.isAnalyticsOpted,
      action: async () => {
        const route = ROUTES.PROFILE.OPT_FOR_ANALYTICS;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.stores.app.goToRoute({ route });
      },
    },
    {
      isDone: () => this.isComplexityLevelSelected,
      action: async () => {
        const route = ROUTES.PROFILE.COMPLEXITY_LEVEL;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        noop(this.stores.profile.selectComplexityLevel(ComplexityLevels.Simple));
      },
    },
    {
      isDone: () => !environment.isNightly() || this.acceptedNightly,
      action: async () => {
        const route = ROUTES.NIGHTLY_INFO;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.stores.app.goToRoute({ route });
      },
    },
    {
      isDone: () => !environment.userAgentInfo.canRegisterProtocol() || this.isUriSchemeAccepted,
      action: async () => {
        const route = ROUTES.PROFILE.URI_PROMPT;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.stores.app.goToRoute({ route });
      },
    },
    {
      isDone: () => this.hasRedirected,
      action: async () => {
        const { stores } = this;
        const { wallets } = stores;

        // note: we want to load memos BEFORE we start syncing wallets
        // this is because syncing wallets will also try and sync memos with external storage
        await stores.memos.loadFromStorage();
        await stores.tokenInfoStore.refreshTokenInfo();
        await stores.coinPriceStore.loadFromStorage();

        await wallets.restoreWalletsFromStorage();
        subscribe();
        if (wallets.hasAnyWallets && stores.loading.fromUriScheme) {
          stores.app.goToRoute({ route: ROUTES.SEND_FROM_URI.ROOT });
        } else {
          const firstWallet =
            wallets.wallets.length !== 0 ? wallets.wallets[0] : null;
          if (firstWallet == null) {
            stores.app.goToRoute({ route: ROUTES.WALLETS.ADD });
            return;
          }
          const lastSelectedWallet = this.stores.wallets.getLastSelectedWallet();
          stores.app.goToRoute({
            route: ROUTES.WALLETS.ROOT,
            publicDeriverId: lastSelectedWallet?.publicDeriverId ?? firstWallet.publicDeriverId,
          });
        }
        if (stores.loading.shouldRedirect) {
          stores.loading.redirect();
        }
        runInAction(() => {
          this.hasRedirected = true;
        });
      },
    },
  ];

  @observable getUriSchemeAcceptanceRequest: Request<(void) => Promise<boolean>> = new Request<
    (void) => Promise<boolean>
  >(this.api.localStorage.getUriSchemeAcceptance);

  @observable setUriSchemeAcceptanceRequest: Request<(void) => Promise<void>> = new Request<
    (void) => Promise<void>
  >(this.api.localStorage.setUriSchemeAcceptance);

  @observable getToggleSidebarRequest: Request<(void) => Promise<boolean>> = new Request<
    (void) => Promise<boolean>
  >(this.api.localStorage.getToggleSidebar);

  @observable setToggleSidebarRequest: Request<(boolean) => Promise<void>> = new Request<
    (boolean) => Promise<void>
  >(this.api.localStorage.setToggleSidebar);

  @observable getWalletsNavigationRequest:
    Request<(void) => Promise<?WalletsNavigation>> = new Request<
    (void) => Promise<?WalletsNavigation>
  >(this.api.localStorage.getWalletsNavigation);

  @observable setWalletsNavigationRequest: Request<
  WalletsNavigation => Promise<void>
  > = new Request<WalletsNavigation => Promise<void>>(
    (walletsNavigation) => this.api.localStorage.setWalletsNavigation(walletsNavigation)
  );

  setup(): void {
    super.setup();
    this.actions.profile.acceptTermsOfUse.listen(this._acceptTermsOfUse);
    this.actions.profile.acceptUriScheme.listen(this._acceptUriScheme);
    this.actions.profile.toggleSidebar.listen(this._toggleSidebar);
    this.actions.profile.setSelectedNetwork.listen(this._setSelectedNetwork);
    this.registerReactions([
      this._checkSetupSteps,
    ]);
    this.actions.profile.updateSortedWalletList.listen(this._updateSortedWalletList);
    this._getUriSchemeAcceptance(); // eagerly cache
    this._getSortedWalletList()
  }

  teardown(): void {
    super.teardown();
  }

  _setBigNumberFormat: void => void = () => {
    BigNumber.config({
      EXPONENTIAL_AT: (1e9: any),
      FORMAT: this.bigNumberDecimalFormat,
    });
  };

  // ========== Active API ========== //

  @computed get selectedNetwork(): void | $ReadOnly<NetworkRow> {
    return this.__selectedNetwork;
  }

  @action _setSelectedNetwork: ($ReadOnly<NetworkRow> | void) => void = type => {
    this.__selectedNetwork = type;
  };

  // ========== Paper Wallets ========== //

  @computed get paperWalletsIntro(): string {
    return getPaperWalletIntro(this.currentLocale, ProfileStore.getDefaultLocale());
  }

  // ========== URI Scheme acceptance ========== //

  @computed get hasLoadedUriSchemeAcceptance(): boolean {
    return (
      this.getUriSchemeAcceptanceRequest.wasExecuted &&
      this.getUriSchemeAcceptanceRequest.result !== null
    );
  }

  @computed get isUriSchemeAccepted(): boolean {
    return this.getUriSchemeAcceptanceRequest.result === true;
  }

  _acceptUriScheme: void => Promise<void> = async () => {
    await this.setUriSchemeAcceptanceRequest.execute();
    await this.getUriSchemeAcceptanceRequest.execute(); // eagerly cache
  };

  _getUriSchemeAcceptance: void => void = () => {
    this.getUriSchemeAcceptanceRequest.execute();
  };

  // ========== Expand / Retract Sidebar ========== //

  @computed get isSidebarExpanded(): boolean {
    let { result } = this.getToggleSidebarRequest;
    if (result == null) {
      result = this.getToggleSidebarRequest.execute().result;
    }
    return result === true;
  }

  _toggleSidebar: void => Promise<void> = async () => {
    const isSidebarExpanded = this.isSidebarExpanded;
    await this.setToggleSidebarRequest.execute(isSidebarExpanded);
    await this.getToggleSidebarRequest.execute();
  };

  // ========== Redirect Logic ========== //

  _checkSetupSteps: void => Promise<void> = async () => {
    const { isLoading } = this.stores.loading;
    if (isLoading) {
      return;
    }
    for (const step of this.SETUP_STEPS) {
      if (!step.isDone()) {
        await step.action();
        return;
      }
    }
  };

  // ========== Sort wallets - Revamp ========== //
  @computed get walletsNavigation(): WalletsNavigation {
    let { result } = this.getWalletsNavigationRequest;
    if (result == null) {
      result = this.getWalletsNavigationRequest.execute().result;
    }
    return result ?? { cardano: [] };
  }
  _getSortedWalletList: void => Promise<void> = async () => {
    await this.getWalletsNavigationRequest.execute();
  };

  _updateSortedWalletList: WalletsNavigation => Promise<void>
    = async (walletsNavigation) => {
    await this.setWalletsNavigationRequest.execute(walletsNavigation);
    await this.getWalletsNavigationRequest.execute();
  };
}

function getPaperWalletIntro(currentLocale: string, defaultLocale: string): string {
  try {
    return require(`../../i18n/locales/paper-wallets/intro/${currentLocale}.md`).default;
  } catch {
    return require(`../../i18n/locales/paper-wallets/intro/${defaultLocale}.md`).default;
  }
}

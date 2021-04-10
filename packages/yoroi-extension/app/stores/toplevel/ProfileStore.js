// @flow
import { action, observable, computed, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
import BaseProfileStore from '../base/BaseProfileStore';
import Request from '../lib/LocalizedRequest';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

export default class ProfileStore extends BaseProfileStore<StoresMap, ActionsMap> {
  @observable __selectedNetwork: void | $ReadOnly<NetworkRow> = undefined;

  /**
   * We only want to redirect users once when the app launches
   */
  @observable
  hasRedirected: boolean = false;

  /** Linear list of steps that need to be completed before app start */
  @observable
  SETUP_STEPS: Array<{| isDone: void => boolean, action: void => Promise<void> |}> = [
    {
      isDone: () => this.isCurrentLocaleSet,
      action: async () => {
        const route = ROUTES.PROFILE.LANGUAGE_SELECTION;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.actions.router.goToRoute.trigger({ route });
      },
    },
    {
      isDone: () => this.areTermsOfUseAccepted,
      action: async () => {
        const route = ROUTES.PROFILE.TERMS_OF_USE;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.actions.router.goToRoute.trigger({ route });
      },
    },
    {
      isDone: () => this.isComplexityLevelSelected,
      action: async () => {
        const route = ROUTES.PROFILE.COMPLEXITY_LEVEL;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.actions.router.goToRoute.trigger({ route });
      },
    },
    {
      isDone: () => !environment.isNightly() || this.acceptedNightly,
      action: async () => {
        const route = ROUTES.NIGHTLY_INFO;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.actions.router.goToRoute.trigger({ route });
      },
    },
    {
      isDone: () => !environment.userAgentInfo.canRegisterProtocol() || this.isUriSchemeAccepted,
      action: async () => {
        const route = ROUTES.PROFILE.URI_PROMPT;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.actions.router.goToRoute.trigger({ route });
      },
    },
    {
      isDone: () => this.hasRedirected,
      action: async () => {
        const { wallets } = this.stores;

        // note: we want to load memos BEFORE we start syncing wallets
        // this is because syncing wallets will also try and sync memos with external storage
        await this.stores.memos.loadFromStorage();
        await this.stores.tokenInfoStore.refreshTokenInfo();
        await this.stores.coinPriceStore.loadFromStorage();

        await wallets.restoreWalletsFromStorage();
        if (wallets.hasAnyWallets && this.stores.loading.fromUriScheme) {
          this.actions.router.goToRoute.trigger({ route: ROUTES.SEND_FROM_URI.ROOT });
        } else {
          const firstWallet =
            wallets.publicDerivers.length !== 0 ? wallets.publicDerivers[0] : null;
          if (firstWallet == null) {
            this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
          } else if (wallets.publicDerivers.length === 1) {
            // if user only has 1 wallet, just go to it directly as a shortcut
            this.actions.router.goToRoute.trigger({
              route: ROUTES.WALLETS.ROOT,
              publicDeriver: firstWallet,
            });
          } else {
            this.actions.router.goToRoute.trigger({
              route: ROUTES.MY_WALLETS,
            });
          }
        }
        if (this.stores.loading.shouldRedirect) {
          this.actions.loading.redirect.trigger();
        }
        runInAction(() => {
          this.hasRedirected = true;
        });
      },
    },
  ];

  @observable setTermsOfUseAcceptanceRequest: Request<(void) => Promise<void>> = new Request<
    (void) => Promise<void>
  >(this.api.localStorage.setTermsOfUseAcceptance);

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

  setup(): void {
    super.setup();
    this.actions.profile.acceptTermsOfUse.listen(this._acceptTermsOfUse);
    this.actions.profile.acceptUriScheme.listen(this._acceptUriScheme);
    this.actions.profile.toggleSidebar.listen(this._toggleSidebar);
    this.actions.profile.setSelectedNetwork.listen(this._setSelectedNetwork);
    this.registerReactions([
      this._checkSetupSteps,
    ]);
    this._getTermsOfUseAcceptance(); // eagerly cache
    this._getUriSchemeAcceptance(); // eagerly cache
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

    // ========== Terms of Use ========== //

  _acceptTermsOfUse: void => Promise<void> = async () => {
    await this.setTermsOfUseAcceptanceRequest.execute();
    await this.getTermsOfUseAcceptanceRequest.execute(); // eagerly cache
  };

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
}

export function getPaperWalletIntro(currentLocale: string, defaultLocale: string): string {
  try {
    return require(`../../i18n/locales/paper-wallets/intro/${currentLocale}.md`).default;
  } catch {
    return require(`../../i18n/locales/paper-wallets/intro/${defaultLocale}.md`).default;
  }
}

// @flow
import BigNumber from 'bignumber.js';
import { action, observable, computed, runInAction } from 'mobx';
import { pathToRegexp } from 'path-to-regexp';
import BaseLoadingStore from '../base/BaseLoadingStore';
import { ROUTES } from '../../routes-config';
import { matchRoute } from '../../utils/routing';
import { getURIParameters } from '../../utils/URIHandling';
import type { UriParams } from '../../utils/URIHandling';
import { isWithinSupply } from '../../utils/validations';
import { networks, defaultAssets } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { getDefaultEntryToken } from './TokenInfoStore';
import type { StoresMap } from '../index';
import {
  TabIdKeys,
} from '../../utils/tabManager';

type SellAdaParamsType = {|
  addr: string,
  redirect: string,
  amount: string,
|};

export default class LoadingStore extends BaseLoadingStore<StoresMap> {
  /**
   * null if app not opened from URI Scheme OR URI scheme was invalid
   */
  @observable _uriParams: ?UriParams = null;
  @observable _shouldRedirect: boolean = false;
  @observable _redirectUri: string = '';
  sellAdaParams: ?SellAdaParamsType = null;

  _originRoute: {|
    // internal route
    route: string,
    // full URL
    location: string,
  |} = { route: '', location: '' };


  setup(): void {
    const params = new URLSearchParams(document.location.search);
    if (params.get('action') === 'sell-ada') {
      const addr = params.get('addr');
      const redirect = params.get('redirect');
      const amount = params.get('amount');
      if (
        typeof addr === 'string' && typeof redirect === 'string' &&
          typeof amount === 'string'
      ) {
        this.sellAdaParams = { addr, redirect, amount, };
      }
    }
  }

  @computed get fromUriScheme(): boolean {
    return matchRoute(ROUTES.SEND_FROM_URI.ROOT, this._originRoute.route);
  }

  @computed get uriParams(): ?UriParams {
    return this._uriParams;
  }

  setUriParams(uriParams: UriParams): void {
    runInAction(() => {
      this._uriParams = uriParams;
    });
  }

  @computed get shouldRedirect(): boolean {
    return this._shouldRedirect;
  }

  @computed get redirectUri() : string {
    return this._redirectUri;
  }

  async preLoadingScreenEnd(): Promise<void> {
    await super.preLoadingScreenEnd();

    if (this.fromUriScheme) {
      const networkId = networks.CardanoMainnet.NetworkId;
      const cardanoMeta = defaultAssets.filter(
        asset => asset.NetworkId === networkId
      )[0];
      const uriParams = await getURIParameters(
        decodeURIComponent(this._originRoute.location),
        currency => {
          // check only currency type from URL, supports only Cardano URL currently
          const valid = currency === 'cardano';
          return Promise.resolve(valid);
        },
        amount => isWithinSupply(amount, new BigNumber(Number.MAX_SAFE_INTEGER)),
        cardanoMeta.Metadata.numberOfDecimals,
        getDefaultEntryToken(cardanoMeta)
      );
      runInAction(() => {
        this._uriParams = uriParams;
      });
    }
  }

  /**
   * Need to clear any data injected by the URI after we've applied it
   */
  @action
  resetUriParams: void => void = (): void => {
    this._uriParams = null;
    this._originRoute = { route: '', location: '' };
  }

  @action
  redirect: void => void = () => {
    this._shouldRedirect = false;
    this.stores.app.goToRoute({
      route: this._redirectUri
    });
  }

  _redirectRegex: RegExp = pathToRegexp(ROUTES.OAUTH_FROM_EXTERNAL.DROPBOX);

  postLoadingScreenEnd(): void {
    super.postLoadingScreenEnd();
    const { stores } = this;
    if (this._redirectRegex.test(stores.app.currentRoute)) {
      this._shouldRedirect = true;
      this._redirectUri = stores.app.currentRoute;
    }
    // before redirecting, save origin route in case we need to come back to
    // it later (this is the case when user comes from a URI link)
    runInAction(() => {
      this._originRoute = {
        route: stores.app.currentRoute,
        location: window.location.href,
      };
    });
    stores.app.goToRoute({ route: ROUTES.ROOT });
  }

  getTabIdKey(): string {
    return TabIdKeys.Primary;
  }
}

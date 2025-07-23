// @flow
import BigNumber from 'bignumber.js';
import { action, observable, computed, runInAction } from 'mobx';
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

  get landingRoute(): string | null {
    const route = this._originRoute.route.replace(/\/$/, '');
    if (route === '') {
      return null;
    }
    return route;
  }

  @computed get fromUriScheme(): boolean {
    return matchRoute(ROUTES.SEND_FROM_URI.ROOT, this._originRoute.route);
  }

  get shouldGotoCashback(): boolean {
    return matchRoute(ROUTES.CASHBACK.ROOT, this._originRoute.route);
  }

  @computed get uriParams(): ?UriParams {
    return this._uriParams;
  }

  setUriParams(uriParams: UriParams): void {
    runInAction(() => {
      this._uriParams = uriParams;
    });
  }

  async loadingEnd(): Promise<void> {
    // Save the landing route and go to the route that shows the loading screen
    runInAction(() => {
      this._originRoute = {
        route: this.stores.routing.currentRoute,
        location: window.location.href,
      };
    });
    this.stores.routing.goToRoute({ route: ROUTES.ROOT });

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

  getTabIdKey(): string {
    return TabIdKeys.Primary;
  }

  isFromCashback(): boolean {
    return /\?from=cashback$/.test(this._originRoute.location);
  }
}

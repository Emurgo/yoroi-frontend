// @flow
import { computed, observable, runInAction } from 'mobx';
import Store from './Store';
import LocalizableError from '../../i18n/LocalizableError';
import { UnableToLoadError } from '../../i18n/errors';
import Request from '../lib/LocalizedRequest';
import { Logger, stringifyError } from '../../utils/logging';
import { closeOtherInstances } from '../../utils/tabManager';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

/** Load dependencies before launching the app */
export default class BaseLoadingStore<TStores, TActions> extends Store<TStores, TActions> {

  @observable error: ?LocalizableError = null;
  @observable _loading: boolean = true;

  @observable loadRustRequest: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(RustModule.load.bind(RustModule));

  __blockingLoadingRequests: Array<[Request<() => Promise<void>>, string]> = [];

  setup(): void {
  }

  registerBlockingLoadingRequest(promise: Promise<void>, name: string): void {
    // promises are wrapped as requests to easier check their errors later
    this.__blockingLoadingRequests.push([new Request(() => promise), name]);
  }

  async load(env: 'connector' | 'extension'): Promise<void> {
    const rustLoadingParams = (env === 'extension') ? ['dontLoadMessagesSigning'] : [];
    await Promise
      .all([
        // $FlowIgnore[invalid-tuple-arity]
        this.loadRustRequest.execute(rustLoadingParams),
        ...(this.__blockingLoadingRequests.map(([r]) => r.execute())),
      ])
      .then(async () => {
        Logger.debug(`[yoroi] closing other instances`);
        await closeOtherInstances(this.getTabIdKey.bind(this)());
        Logger.debug(`[yoroi][preLoadingScreenEnd]`);
        await this.preLoadingScreenEnd.bind(this)();
        runInAction(() => {
          this.error = null;
          this._loading = false;
          this.postLoadingScreenEnd();
          Logger.debug(`[yoroi] loading ended`);
        });
        return undefined;
      })
      .catch((error) => {
        const isRustLoadError = this.loadRustRequest.error != null;
        const failedBlockingLoadingRequestName =
          this.__blockingLoadingRequests.find(([r]) => r.error != null)?.[1];
        const errorType =
          (isRustLoadError && 'rust')
          || failedBlockingLoadingRequestName
          || 'unclear';
        Logger.error(
          `${nameof(BaseLoadingStore)}::${nameof(this.load)}
           Unable to load libraries (error type: ${errorType}) `
          + stringifyError(error)
        );
        runInAction(() => {
          this.error = new UnableToLoadError();
        });
      });
  }

  @computed get isLoading(): boolean {
    return !!this._loading;
  }

  getTabIdKey(): string {
    throw new Error(`${nameof(BaseLoadingStore)}::${nameof(this.getTabIdKey)} child needs to override this function`);
  }

  async preLoadingScreenEnd(): Promise<void> {
    // eslint-disable-line no-empty-function
  }
  postLoadingScreenEnd(): void {
    // eslint-disable-line no-empty-function
  }
}

// @flow
import { observable } from 'mobx';
import Store from './Store';

interface ProfileStore {
  get currentLocale(): string,
}
export type RequiredStores = {
  +profile: ProfileStore,
  ...
};
export default class BaseStateFetchStore
  <
    TStores: RequiredStores,
    TActions,
    TFetcher
  > extends Store<TStores, TActions> {

  @observable fetcher: TFetcher;

  setup(): void {
    super.setup();
  }
}

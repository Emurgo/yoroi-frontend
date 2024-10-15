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
    IFetcher
  > extends Store<TStores> {

  @observable fetcher: IFetcher;

  setup(): void {
    super.setup();
  }
}

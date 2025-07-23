// @flow
import Reaction from '../lib/Reaction';
import type { Api } from '../../api/index';

// Base store class used by all stores in our application
export default class Store<TStores> {

  stores: TStores;
  api: Api;

  _reactions: Array<Reaction> = [];

  constructor(stores: TStores, api: Api) {
    this.stores = stores;
    this.api = api;
  }

  /** Register a set of autoruns with the same lifetime as the store */
  registerReactions(reactions: Array<Function>): void {
    reactions.forEach(reaction => this._reactions.push(new Reaction(reaction)));
  }

  setup(): void {}

  initialize(): void {
    this.setup();
    this.startReactions();
  }

  startReactions(): void {
    this._reactions.forEach(reaction => reaction.start());
  }

  teardown(): void {
    this._reactions.forEach(reaction => reaction.stop());
  }
}

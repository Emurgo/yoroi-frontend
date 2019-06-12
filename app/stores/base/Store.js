// @flow
import Reaction from '../lib/Reaction';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import type { Api } from '../../api/index';

// Base store class used by all stores in our application
export default class Store {

  stores: StoresMap;
  api: Api;
  actions: ActionsMap;

  _reactions: Array<Reaction> = [];

  constructor(stores: StoresMap, api: Api, actions: ActionsMap) {
    this.stores = stores;
    this.api = api;
    this.actions = actions;
  }

  /** Register a set of autoruns with the same lifetime as the store */
  registerReactions(reactions: Array<Function>) {
    reactions.forEach(reaction => this._reactions.push(new Reaction(reaction)));
  }

  setup() {}

  initialize() {
    this.setup();
    this.startReactions();
  }

  startReactions() {
    this._reactions.forEach(reaction => reaction.start());
  }

  teardown() {
    this._reactions.forEach(reaction => reaction.stop());
  }
}

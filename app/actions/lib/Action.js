// @flow
import { bindAll } from 'lodash';

/**
 * Listener type as Function that takes specific params <P>
 */
export type Listener<P> = (params: P) => Promise<void>|void;

/**
 * Action class with typed params
 */
export default class Action<Params> {

  /**
   * Array of all defined actions in the system
   * @type {[Action]}
   */
  static actions: Action<Params>[] = [];

  static resetAllActions() {
    Action.actions.forEach(action => action.removeAll());
  }

  listeners: Listener<Params>[] = [];

  constructor() {
    bindAll(this, ['trigger']);
    Action.actions.push(this);
  }

  listen(listener: Listener<Params>) {
    this.listeners.push(listener);
  }

  /*
   Add a listener that is fired first when the action is triggered (unless
   another listener is added this way later).
   */
  listenWithPriority(listener: Listener<Params>) {
    this.listeners.unshift(listener);
  }

  trigger(params: Params) {
    this.listeners.forEach(listener => listener(params));
  }

  remove(listener: Listener<Params>) {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }

  removeAll() {
    this.listeners = [];
  }

  once(listener: Listener<Params>) {
    this.listeners.push((...args) => {
      this.remove(listener);
      listener(...args);
    });
  }
}

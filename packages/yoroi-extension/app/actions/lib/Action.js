// @flow
import { bindAll } from 'lodash';

/**
 * Listener type as Function that takes specific params <P>
 */
export type SyncListener<P> = (params: P) => void;
export type AsyncListener<P> = (params: P) => Promise<void>;

class BaseAction<ListenerType, Params> {

  /**
   * Array of all defined actions in the system
   * @type {[BaseAction]}
   */
  static actions: BaseAction<ListenerType, Params>[] = [];

  static resetAllActions(): void {
    Action.actions.forEach(action => action.removeAll());
  }

  listeners: ListenerType[] = [];

  constructor() {
    bindAll(this, ['trigger']);
    BaseAction.actions.push(this);
  }

  listen(listener: ListenerType): void {
    this.listeners.push(listener);
  }

  remove(listener: ListenerType): void {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }

  removeAll(): void {
    this.listeners = [];
  }
}

export class Action<Params> extends BaseAction<SyncListener<Params>, Params> {
  trigger(params: Params): void {
    this.listeners.forEach(listener => listener(params));
  }
}

export class AsyncAction<Params> extends BaseAction<AsyncListener<Params>, Params> {
  async trigger(params: Params): Promise<void> {
    for (const listener of this.listeners) {
      await listener(params);
    }
  }
}

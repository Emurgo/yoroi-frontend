// @flow
import { observable, action, computed, isObservableArray } from 'mobx';
import { isEqual } from 'lodash/fp';
import { defineMessages } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';

const messages = defineMessages({
  apiMethodNotYetImplementedError: {
    id: 'api.errors.ApiMethodNotYetImplementedError',
    defaultMessage: '!!!This API method is not yet implemented.',
  },
  promiseNotCalledYetError: {
    id: 'api.errors.PromiseNotCalledYetError',
    defaultMessage: '!!!Result accessed before execution finished.',
  },
});

export type ApiCallType<Func: Function> = {|
  args: Arguments<Func>,
  result: ?PromisslessReturnType<Func>,
|};

// Note: Do not use this class directly. Only use LocalizedRequest or CachedLocalizedRequest
export default class Request<Func: (...args: any) => Promise<any>, Err> {
  @observable result: ?PromisslessReturnType<Func> = null;
  @observable error: ?Err = null;
  @observable isExecuting: boolean = false;
  @observable wasExecuted: boolean = false;

  currentlyExecuting: Set<number> = new Set();
  promise: ?Promise<PromisslessReturnType<Func>> = null;

  _method: Func;
  _isWaitingForResponse: boolean = false;
  _currentApiCall: ?ApiCallType<Func> = null;

  constructor(method: Func) {
    this._method = method;
  }

  execute(...callArgs: Arguments<Func>): Request<Func, Err> {
    // Do not continue if this request is already loading
    if (this._isWaitingForResponse) return this;

    // This timeout is necessary to avoid warnings from mobx
    // regarding triggering actions as side-effect of getters
    setTimeout(
      action('Request::execute (setting this.isExecuting)', () => {
        this.isExecuting = true;
      }),
      0
    );

    const executionId = Math.random();
    this.currentlyExecuting.add(executionId);
    // Issue api call & save it as promise that is handled to update the results of the operation
    this.promise = new Promise((resolve, reject) => {
      if (!this._method) {
        reject(new ApiMethodNotYetImplementedError());
      }
      this._method(...callArgs)
        .then(result => {
          if (this.currentlyExecuting.has(executionId)) {
            this.currentlyExecuting.delete(executionId);
          } else {
            resolve(result);
            return;
          }
          setTimeout(
            action('Request::execute/then', () => {
              if (this.result != null && isObservableArray(this.result) && Array.isArray(result)) {
                this.result.replace(result);
              } else {
                this.result = result;
              }
              if (this._currentApiCall) this._currentApiCall.result = result;
              this.isExecuting = false;
              this.wasExecuted = true;
              this.error = null;
              this._isWaitingForResponse = false;
              resolve(result);
            }),
            1
          );
          return result;
        })
        .catch(
          action('Request::execute/catch', error => {
            if (this.currentlyExecuting.has(executionId)) {
              this.currentlyExecuting.delete(executionId);
            } else {
              reject(error);
              return;
            }
            setTimeout(
              action(() => {
                this.error = error;
                this.result = null;
                this.isExecuting = false;
                this.wasExecuted = true;
                this._isWaitingForResponse = false;
                reject(error);
              }),
              1
            );
          })
        );
    });

    this._isWaitingForResponse = true;
    this._currentApiCall = { args: callArgs, result: null };
    return this;
  }

  isExecutingWithArgs(...args: Arguments<Func>): boolean {
    return this.isExecuting && this._currentApiCall != null && isEqual(this._currentApiCall.args, args);
  }

  @computed get isExecutingFirstTime(): boolean {
    return !this.wasExecuted && this.isExecuting;
  }

  // Turn Requests into promise-like objects by adding "then" and "catch"
  then(...args: Array<any>): Promise<PromisslessReturnType<Func>> {
    if (!this.promise) throw new NotExecutedYetError();
    return this.promise.then(...args);
  }
  catch(...args: Array<any>): Promise<any> {
    if (!this.promise) throw new NotExecutedYetError();
    return this.promise.catch(...args);
  }

  /**
   * Asynchronously patch the result of the request.
   * This can be used for optimistic UI updates before the server has confirmed the change.
   *
   * @param modify {Function} - Custom function to patch the result (which gets passed in as
   * only param) You can either change the result directly (e.g: `result.push(something)` or
   * if you need to replace the whole result of the request you need to return it from this
   * function.
   *
   * @returns {Promise}
   */
  patch(modify: (PromisslessReturnType<Func>) => ?PromisslessReturnType<Func>): Promise<Request<Func, Err>> {
    return new Promise(resolve => {
      setTimeout(
        action(() => {
          const override = modify(this.result);
          if (override !== undefined) this.result = override;
          if (this._currentApiCall) this._currentApiCall.result = this.result;
          resolve(this);
        }),
        0
      );
    });
  }

  @action cancel(): Request<Func, Err> {
    this.isExecuting = false;
    this._isWaitingForResponse = false;
    this._currentApiCall = null;
    return this;
  }
  @action reset(): void {
    this.result = null;
    this.error = null;
    this.isExecuting = false;
    this.wasExecuted = false;
    this._isWaitingForResponse = false;
    this._currentApiCall = null;
  }
}

export class ApiMethodNotYetImplementedError extends LocalizableError {
  constructor() {
    super({
      id: messages.apiMethodNotYetImplementedError.id,
      defaultMessage: messages.apiMethodNotYetImplementedError.defaultMessage || '',
    });
  }
}

export class NotExecutedYetError extends LocalizableError {
  constructor() {
    super({
      id: messages.apiMethodNotYetImplementedError.id,
      defaultMessage: messages.apiMethodNotYetImplementedError.defaultMessage || '',
    });
  }
}

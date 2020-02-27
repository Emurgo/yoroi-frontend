// @flow
import { action } from 'mobx';
import { isEqual, remove } from 'lodash';
import Request from './Request';
import type { ApiCallType } from './Request';

export default class CachedRequest<
  Func: (...args: any) => Promise<any>, Error
> extends Request<Func, Error> {

  _apiCalls: Array<ApiCallType<Func>> = [];
  _isInvalidated: boolean = true;

  execute(...callArgs: Arguments<Func>): CachedRequest<Func, Error> {
    // Do not continue if this request is already loading
    if (this._isWaitingForResponse) return this;

    // Very simple caching strategy -> only continue if the call / args changed
    // or the request was invalidated manually from outside
    const existingApiCall = this._findApiCall(callArgs);

    // Invalidate if new or different api call will be done
    if (existingApiCall && existingApiCall !== this._currentApiCall) {
      this._isInvalidated = true;
      this._currentApiCall = existingApiCall;
    } else if (!existingApiCall) {
      this._isInvalidated = true;
      this._currentApiCall = this._addApiCall(callArgs);
    }

    // Do not continue if this request is not invalidated (see above)
    if (!this._isInvalidated) return this;

    // This timeout is necessary to avoid warnings from mobx
    // regarding triggering actions as side-effect of getters
    setTimeout(action(() => {
      this.isExecuting = true;
      // Apply the previous result from this call immediately (cached)
      if (existingApiCall) {
        this.result = existingApiCall.result;
      }
    }), 0);

    const executionId = Math.random();
    this.currentlyExecuting.add(executionId);
    // Issue api call & save it as promise that is handled to update the results of the operation
    this.promise = new Promise((resolve, reject) => {
      this._method(...callArgs)
        .then((result) => {
          if (this.currentlyExecuting.has(executionId)) {
            this.currentlyExecuting.delete(executionId);
          } else {
            resolve(result);
            return;
          }
          setTimeout(action(() => {
            this.result = result;
            if (this._currentApiCall) this._currentApiCall.result = result;
            this.isExecuting = false;
            this.wasExecuted = true;
            this._isInvalidated = false;
            this._isWaitingForResponse = false;
            resolve(result);
          }), 1);
          return result;
        })
        .catch(action((error) => {
          if (this.currentlyExecuting.has(executionId)) {
            this.currentlyExecuting.delete(executionId);
          } else {
            reject(error);
            return;
          }
          setTimeout(action(() => {
            this.error = error;
            this.isExecuting = false;
            this.isError = true;
            this.wasExecuted = true;
            this._isWaitingForResponse = false;
            reject(error);
          }), 1);
        }));
    });

    this._isWaitingForResponse = true;
    return this;
  }

  /** Invalidate cache so the request can get reissued.
   * @param immediately call the request right away after invalidating
   */
  invalidate(
    options: {| immediately: boolean, |} = { immediately: false }
  ): CachedRequest<Func, Error> {
    this._isInvalidated = true;
    if (options.immediately && this._currentApiCall) {
      return this.execute(...this._currentApiCall.args);
    }
    return this;
  }

  removeCacheForCallWith(...args: Arguments<Func>): Array<ApiCallType<Func>> {
    return remove(this._apiCalls, c => isEqual(c.args, args));
  }

  _addApiCall(args: Arguments<Func>): ApiCallType<Func> {
    const newCall = { args, result: null };
    this._apiCalls.push(newCall);
    return newCall;
  }

  _findApiCall(args: Arguments<Func>): ?ApiCallType<Func> {
    return this._apiCalls.find(c => isEqual(c.args, args));
  }

  /** Reset request properties including cache */
  reset(): void {
    super.reset();
    this._isInvalidated = true;
  }

}

// @flow

import CachedRequest from './CachedRequest';
import LocalizableError from '../../i18n/LocalizableError';

/*
* We want all errors in our program to be localizable
* So we partially apply the LocalizableError to the CachedRequest template
*/
export default class LocalizedCachedRequest<
  Func: (...args: any) => Promise<any>
> extends CachedRequest<Func, LocalizableError> {}

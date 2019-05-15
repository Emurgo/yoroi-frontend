// @flow

import Request from './Request';
import LocalizableError from '../../i18n/LocalizableError';

/*
* We want all errors in our program to be localizable
* So we partially apply the LocalizableError to the Request template
*/
export default class LocalizedRequest<
  Func: (...args: any) => Promise<any>
> extends Request<Func, LocalizableError> {}

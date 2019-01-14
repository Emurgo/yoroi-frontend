import Request from './Request';
import LocalizableError from '../../i18n/LocalizableError';

/*
* We want all errors in our program to be localizable
* So we partially apply the LocalizableError to the Request template
*/
export default class LocalizedRequest<Result> extends Request<Result, LocalizableError> {}

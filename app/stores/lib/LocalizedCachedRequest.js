import CachedRequest from './CachedRequest';
import LocalizableError from '../../i18n/LocalizableError';

/*
* We want all errors in our program to be localizable
* So we partially apply the LocalizableError to the CachedRequest template
*/
export default
class LocalizedCachedRequest<Result> extends CachedRequest<Result, LocalizableError> {}

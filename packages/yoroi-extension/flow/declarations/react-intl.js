// @flow

declare module "react-intl" {
  declare export var IntlContext: any;
  declare export var IntlProvider: any;
  declare export var useIntl: Function;
  declare export var FormattedMessage: any;
  declare export var defineMessages: any;
  declare export var injectIntl: Function;
  declare export type $npm$ReactIntl$MessageDescriptor = {
    id: string,
    description?: string,
    defaultMessage?: string,
    ...
  };
  declare export interface $npm$ReactIntl$IntlFormat {
    formatMessage: Function;
  }
  declare export interface $npm$ReactIntl$IntlShape {
    formatMessage: Function;
  }
  declare export type MessageDescriptor = $npm$ReactIntl$MessageDescriptor;
}

// @flow

export type UnitOfAccountSettingType = {|
  enabled: true,
  currency: string,
|} | {|
  enabled: false,
  currency: ?string
|};

export const unitOfAccountDisabledValue: UnitOfAccountSettingType = {
  enabled: false,
  currency: null
};

export const DEFAULT_CURRENCY_PAIR = { enabled: true, currency: 'USD' }

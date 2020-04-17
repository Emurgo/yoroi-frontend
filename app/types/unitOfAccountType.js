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

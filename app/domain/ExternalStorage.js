// @flow

export const ExternalStorageList = {
  DROPBOX: 'dropbox',
  // GOOGLE_DRIVE: 'google_drive',
};
export type ExternalStorageListType = $Values<typeof ExternalStorageList>;

export type SelectedExternalStorageProvider = {|
  provider: ExternalStorageListType,
  token: string,
|};

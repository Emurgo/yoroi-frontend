// @flow
import { DROPBOX_CLIENT_ID } from '../config/externalStorage';

export const ExternalStorageList = {
  DROPBOX: 'dropbox',
  // GOOGLE_DRIVE: 'google_drive',
};
export type ExternalStorageListType = $Values<typeof ExternalStorageList>;

export type SelectedExternalStorageProvider = {
  provider: ExternalStorageListType,
  token: string,
}

export type ExternalStorageProviderType = {
  name: string,
  authorize_url: string
}

export const ExternalStorageProviders: {
  [key: ExternalStorageListType]: ExternalStorageProviderType
} = Object.freeze({
  [ExternalStorageList.DROPBOX]: {
    name: 'Dropbox',
    authorize_url: `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_CLIENT_ID}&response_type=token&redirect_uri=%s/#`,
  },
  // [ExternalStorageList.GOOGLE_DRIVE]: {
  //   name: 'Google Drive'
  // }
});

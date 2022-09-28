// @flow

export const testRunsDataDir = './testRunsData';
export const snapshotsDir = './features/yoroi_snapshots/';

export const mailsacAPIKey = process.env.MAILSAC_API_KEY;
export const mailsacEmail = 'emurgoqa@mailsac.com';
export const emailOptions = {
  method: 'get',
  url: `https://mailsac.com/api/addresses/${mailsacEmail}/messages`,
  headers: { 'Mailsac-Key': mailsacAPIKey },
};

export const commonWalletPassword = 'asdfasdfasdf';
export const txSuccessfulStatuses = ['high', 'medium', 'low'];
export const halfSecond = 500;
export const oneSecond = 1000;
export const defaultRepeatPeriod = oneSecond;
export const defaultWaitTimeout = 10 * oneSecond;
export const quarterMinute = 15 * oneSecond;
export const halfMinute = 30 * oneSecond;
export const oneMinute = 60 * oneSecond;
export const fiveMinute = 5 * oneMinute;

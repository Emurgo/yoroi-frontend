// @flow

export const testRunsDataDir = './testRunsData/';
export const snapshotsDir = './features/yoroi_snapshots/';
export const testRunsLogsDir = `${testRunsDataDir}Logs/`;
export const mockDAppLogsDir = `${testRunsLogsDir}mockDApp/`;
export const windowManagerLogsDir = `${testRunsLogsDir}windowManager/`;

export const mailsacAPIKey = process.env.MAILSAC_API_KEY;
export const mailsacEmail = 'emurgoqa@mailsac.com';
export const emailOptions = {
  method: 'get',
  url: `https://mailsac.com/api/addresses/${mailsacEmail}/messages`,
  headers: { 'Mailsac-Key': mailsacAPIKey },
};

export const commonWalletPassword = 'asdfasdfasdf';
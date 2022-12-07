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
export const fiveSeconds = 5 * oneSecond;
export const defaultWaitTimeout = 10 * oneSecond;
export const quarterMinute = 15 * oneSecond;
export const halfMinute = 30 * oneSecond;
export const oneMinute = 60 * oneSecond;
export const fiveMinute = 5 * oneMinute;

export const displayInfo = {
  'many-tx-wallet': {
    txType: 'ADA intrawallet transaction',
    txAmount: '-0.169999',
    txTime: '2019-04-21T15:13:33.000Z',
    txStatus: 'HIGH',
    txFrom: [['Ae2tdPwUPE...VWfitHfUM9', 'BYRON - INTERNAL', '-0.82 ADA']],
    txTo: [
      ['Ae2tdPwUPE...iLjTnt34Aj', 'BYRON - EXTERNAL', '+0.000001 ADA'],
      ['Ae2tdPwUPE...BA7XbSMhKd', 'BYRON - INTERNAL', '+0.65 ADA'],
    ],
    txId: '0a073669845fea4ae83cd4418a0b4fd56610097a89601a816b5891f667e3496c',
    txConfirmations: 'High. 104 confirmations.',
    txFee: '0.169999',
  },
  'simple-pending-wallet': {
    txType: 'ADA intrawallet transaction',
    txAmount: '-0.999999',
    txTime: '2019-04-20T23:14:52.000Z',
    txStatus: 'PENDING',
    txFrom: [['Ae2tdPwUPE...e1cT2aGdSJ', 'BYRON - EXTERNAL', '-1 ADA']],
    txTo: [['Ae2tdPwUPE...sTrQfTxPVX', 'PROCESSING...', '+0.000001 ADA']],
    txId: 'fa6f2c82fb511d0cc9c12a540b5fac6e5a9b0f288f2d140f909f981279e16fbe',
    txFee: '0.999999',
  },
  'failed-single-tx': {
    txType: 'ADA sent',
    txAmount: '-0.18',
    txTime: '2019-04-20T23:14:51.000Z',
    txStatus: 'FAILED',
    txFrom: [['Ae2tdPwUPE...gBfkkDNBNv', 'BYRON - EXTERNAL', '-1 ADA']],
    txTo: [
      ['Ae2tdPwUPE...xJPmFzi6G2', 'ADDRESS BOOK', '+0.000001 ADA'],
      ['Ae2tdPwUPE...bL4UYPN3eU', 'BYRON - INTERNAL', '+0.82 ADA'],
    ],
    txId: 'fc6a5f086c0810de3048651ddd9075e6e5543bf59cdfe5e0c73bf1ed9dcec1ab',
    txFee: '0.179999',
  },
};

export const fakeAddresses = [
  'Ae2tdPwUPEZBxVncTviWLPFDukXL7tDWfGXkLMw8CSjqZhPGB7SHkUFaASB',
  'Ae2tdPwUPEZKTSRpuAt5GhVda8ZAoPXHTXzX9xSP2Ms7YyakwAyREYBpR11',
];
import { defineMessages, injectIntl } from 'react-intl';

export const messages = defineMessages({
  currentStakePool: {
    id: 'wallet.transitionDialog.currentStakePool',
    defaultMessage:
      '!!! The current stake pool youre using will soon close. Migrate to the new EMURGO pool to sustain reward generation.',
  },
  upgradeStakePool: {
    id: 'wallet.transitionDialog.upgradeStakePool',
    defaultMessage: '!!! UPGRADE YOUR STAKE POOL',
  },
  skipAndStop: {
    id: 'wallet.transitionDialog.skipAndStop',
    defaultMessage: '!!! SKIP AND STOP RECEIVING REWARDS',
  },
  updateNow: {
    id: 'wallet.transitionDialog.updateNow',
    defaultMessage: '!!! UPDATE NOW AND KEEP EARNING',
  },
  currentPool: {
    id: 'wallet.transitionDialog.currentPool',
    defaultMessage: '!!! Current Pool',
  },
  newPool: {
    id: 'wallet.transitionDialog.newPool',
    defaultMessage: '!!! New Pool',
  },
  estimatedROA: {
    id: 'wallet.transitionDialog.estimatedROA',
    defaultMessage: '!!! Estimated ROA',
  },
  fee: {
    id: 'wallet.transitionDialog.fee',
    defaultMessage: '!!! Fee',
  },
  poolContinues: {
    id: 'wallet.transitionDialog.poolContinues',
    defaultMessage: '!!! This pool continues to generate staking rewards',
  },
  poolStop: {
    id: 'wallet.transitionDialog.poolStop',
    defaultMessage: '!!! This pool will stop generating staking rewards in',
  },
  poolNotGenerating: {
    id: 'wallet.transitionDialog.poolNotGenerating',
    defaultMessage: '!!! This pool is NOT generating staking rewards anymore',
  },
});

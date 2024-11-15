import { useRef } from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from '../context/intl/IntlProvider.tsx';

export const messages = Object.freeze(
  defineMessages({
    back: {
      id: 'swap.back',
      defaultMessage: '!!!Back',
    },
    slippageTolerance: {
      id: 'swap.actions.slippageTolerance',
      defaultMessage: '!!!Slippage Tolerance',
    },
    slippageToleranceTooltip: {
      id: 'swap.actions.slippageToleranceTooltip',
      defaultMessage:
        '!!!Slippage tolerance is set as a percentage of the total swap value. Your transactions will not be executed if the price moves by more than this amount',
    },
    clear: {
      id: 'swap.actions.clear',
      defaultMessage: '!!!Clear',
    },
    marketTabLabel: {
      id: 'swap.actions.marketTabLabel',
      defaultMessage: '!!!Market',
    },
    limitTabLabel: {
      id: 'swap.actions.limitTabLabel',
      defaultMessage: '!!!Limit',
    },
    swapToLabel: {
      id: 'swap.swapToLabel',
      defaultMessage: '!!!Swap to',
    },
    dexLabel: {
      id: 'swap.dexLabel',
      defaultMessage: '!!!DEX',
    },
    sendUsingLedgerNano: {
      id: 'wallet.send.ledger.confirmationDialog.submit',
      defaultMessage: '!!!Send using Ledger',
    },
    sendUsingTrezorT: {
      id: 'wallet.send.trezor.confirmationDialog.submit',
      defaultMessage: '!!!Send using Trezor',
    },
  })
);

export const useStrings = () => {
  const { intl } = useIntl();

  return useRef({
    back: intl.formatMessage(messages.back),
    slippageTolerance: intl.formatMessage(messages.slippageTolerance),
    slippageToleranceTooltip: intl.formatMessage(messages.slippageToleranceTooltip),
    clear: intl.formatMessage(messages.clear),
    marketTabLabel: intl.formatMessage(messages.marketTabLabel),
    limitTabLabel: intl.formatMessage(messages.limitTabLabel),
    swapToLabel: intl.formatMessage(messages.swapToLabel),
    dexLabel: intl.formatMessage(messages.dexLabel),
    sendUsingLedgerNano: intl.formatMessage(messages.sendUsingLedgerNano),
    sendUsingTrezorT: intl.formatMessage(messages.sendUsingTrezorT),
  }).current;
};

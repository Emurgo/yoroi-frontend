// @flow

import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, IntlContext } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import Dialog from '../../widgets/Dialog';
import { Stack, Typography } from '@mui/material';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import { ReactComponent as SuccessImg } from '../../../assets/images/revamp/tx-submitted.inline.svg';
import globalMessages from '../../../i18n/global-messages';

const messages = defineMessages({
  title: {
    id: 'wallet.transaction.success.title',
    defaultMessage: '!!!Transaction submitted',
  },
  explanation: {
    id: 'wallet.transaction.success.explanation',
    defaultMessage: '!!!Check this transaction in the list of wallet transactions',
  },
  sellSendDone: {
    id: 'wallet.transactions.success.sell',
    defaultMessage: '!!!Transaction has been submitted',
  },
  goToExchange: {
    id: 'wallet.transactions.success.button.exchange',
    defaultMessage: '!!!Go to the exchange page',
  },
});

type Props = {|
  +onClose: void => PossiblyAsync<void>,
  +process: 'for-sell' | 'normal',
|};

@observer
export default class TransactionSuccessDialog extends Component<Props> {
  static contextType = IntlContext;
  render(): Node {
    const { intl } = this.context;

    return (
      <Dialog
        // title={intl.formatMessage(messages.title)}
        dialogActions={[
          {
            label: intl.formatMessage(this.props.process === 'normal' ? globalMessages.goToTransactions : messages.goToExchange),
            onClick: this.props.onClose,
            primary: true,
          },
        ]}
        onClose={this.props.onClose}
        closeButton={<DialogCloseButton />}
      >
        <Stack alignItems="center">
          <SuccessImg />
          <Typography mt="48px" color="ds.text_gray_medium" fontWeight="500" variant="h4">
            {intl.formatMessage(messages.title)}
          </Typography>
          <Typography varianr="body1" color="ds.text_gray_low" mt="8px" textAlign="center">
            {intl.formatMessage(this.props.process === 'normal' ? messages.explanation : messages.sellSendDone)}
          </Typography>
        </Stack>
      </Dialog>
    );
  }
}

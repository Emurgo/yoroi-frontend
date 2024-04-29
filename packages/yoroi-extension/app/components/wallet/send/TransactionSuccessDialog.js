// @flow

import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import Dialog from '../../widgets/Dialog/Dialog';
import { Stack, Typography } from '@mui/material';
import DialogCloseButton from '../../widgets/Dialog/DialogCloseButton';
import { ReactComponent as SuccessImg } from '../../../assets/images/transfer-success.inline.svg';
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
});

type Props = {|
  +onClose: void => PossiblyAsync<void>,
  +classicTheme: boolean,
|};

@observer
export default class TransactionSuccessDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <Dialog
        title={intl.formatMessage(messages.title)}
        actions={[
          {
            label: intl.formatMessage(globalMessages.goToTransactions),
            onClick: this.props.onClose,
            primary: true,
          },
        ]}
        onClose={this.props.onClose}
        closeButton={<DialogCloseButton />}
      >
        <Stack alignItems="center">
          <SuccessImg />
          <Typography component="div"
            color="gray.700"
            fontWeight={500}
            mt="16px"
            textAlign="center"
            maxWidth="400px"
          >
            {intl.formatMessage(messages.explanation)}
          </Typography>
        </Stack>
      </Dialog>
    );
  }
}

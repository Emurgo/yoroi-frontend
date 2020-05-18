// @flow
import React, { Component } from 'react';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { observer } from 'mobx-react';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';

import styles from './DebugWalletDialog.scss';

const messages = defineMessages({
  explanation1: {
    id: 'wallet.debugwallet.explanation1',
    defaultMessage: '!!!The wallet you selected ({checksumTextPart}) is for testing and debugging purposes.',
  },
  explanation2: {
    id: 'wallet.debugwallet.explanation2',
    defaultMessage: '!!!To avoid any issues, do not use this wallet. Instead, use Yoroi to create a new wallet.',
  },
  explanation3: {
    id: 'wallet.debugwallet.explanation3',
    defaultMessage: '!!!If you did not expect this message, please {contactSupportLink}.',
  },
});

type Props = {|
  +onClose: void => void,
  +onExternalLinkClick: MouseEvent => void,
  +checksumTextPart: string,
|};

@observer
export default class DebugWalletDialog extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    const contactSupportLink = (
      <a
        className={styles.link}
        href={intl.formatMessage(globalMessages.supportRequestLinkUrl)}
        onClick={event => this.props.onExternalLinkClick(event)}
      >
        {intl.formatMessage(globalMessages.contactSupport)}
      </a>
    );

    const { checksumTextPart } = this.props;
    return (
      <Dialog
        title={intl.formatMessage(globalMessages.attentionTitle)}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={this.props.onClose}
      >
        <div className={styles.component}>
          <div className={styles.header}>
            <FormattedMessage {...messages.explanation1} values={{ checksumTextPart }} /><br />
            {intl.formatMessage(messages.explanation2)}
          </div>
          <FormattedMessage {...messages.explanation3} values={{ contactSupportLink }} />
        </div>
      </Dialog>
    );
  }
}

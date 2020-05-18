// @flow
import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { observer } from 'mobx-react';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';

import styles from './DebugWalletDialog.scss';

const messages = defineMessages({
  header: {
    id: 'wallet.debugwallet.header',
    defaultMessage: '!!!TODO',
  },
});

type Props = {|
  +close: void => void,
|};

@observer
export default class DebugWalletDialog extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.attentionTitle)}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={this.props.close}
      >
        <div className={styles.component}>
          <div className={styles.header}>
            {intl.formatMessage(messages.header)}
          </div>
        </div>
      </Dialog>
    );
  }
}

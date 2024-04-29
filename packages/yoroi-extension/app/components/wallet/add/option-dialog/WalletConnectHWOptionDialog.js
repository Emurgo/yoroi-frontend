// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import globalMessages from '../../../../i18n/global-messages';
import Dialog from '../../../widgets/Dialog/Dialog';
import DialogCloseButton from '../../../widgets/Dialog/DialogCloseButton';
import OptionBlock from '../../../widgets/options/OptionBlock';

import styles from '../../../widgets/options/OptionListWrapperStyle.scss';

const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.add.optionDialog.connect.hw.dialogTitle',
    defaultMessage: '!!!Connect to hardware wallet',
  },
  ledgerDescription: {
    id: 'wallet.add.optionDialog.connect.hw.ledger.learnMoreText',
    defaultMessage: '!!!A Ledger hardware wallet is a small USB device that adds an extra level of security to your wallet. It is more secure because your private key never leaves the hardware wallet. This protects your funds even if your computer is compromised due to malware, phishing attempts, etc.',
  },
  trezorDescription: {
    id: 'wallet.add.optionDialog.connect.hw.trezor.learnMoreText',
    defaultMessage: '!!!A Trezor hardware wallet is a small USB device that adds an extra level of security to your wallet. It is more secure because your private key never leaves the hardware wallet. This protects your funds even if your computer is compromised due to malware, phishing attempts, etc.',
  },
});

type Props = {|
  +onCancel: void => void,
  +onTrezor: void => void,
  +onLedger: void => void,
|};

@observer
export default class WalletConnectHWOptionDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { onCancel, onTrezor, onLedger, } = this.props;

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        closeOnOverlayClick={false}
        onClose={onCancel}
        closeButton={<DialogCloseButton />}
        className="WalletConnectHWOptionDialog"
      >
        <div className={styles.component}>
          <ul className={styles.optionBlockList}>
            <OptionBlock
              parentName="WalletConnectHWOptionDialog"
              type="connectLedger"
              title={intl.formatMessage(globalMessages.ledgerTitle)}
              learnMoreText={intl.formatMessage(messages.ledgerDescription)}
              onSubmit={onLedger}
            />
            <OptionBlock
              parentName="WalletConnectHWOptionDialog"
              type="connectTrezor"
              onSubmit={onTrezor}
              title={intl.formatMessage(globalMessages.trezorTitle)}
              learnMoreText={intl.formatMessage(messages.trezorDescription)}
            />
          </ul>
        </div>
      </Dialog>
    );
  }
}

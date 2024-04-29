// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import Dialog from '../../../widgets/Dialog/Dialog';
import DialogCloseButton from '../../../widgets/Dialog/DialogCloseButton';
import OptionBlock from '../../../widgets/options/OptionBlock';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from '../../../widgets/options/OptionListWrapperStyle.scss';

const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.add.optionDialog.restore.dialogTitle',
    defaultMessage: '!!!Restore wallet',
  },
  restoreNormalTitle: {
    id: 'wallet.add.optionDialog.restore.normalWallet.title',
    defaultMessage: '!!!Enter a {length}-word recovery phrase',
  },
  restoreNormalDescription: {
    id: 'wallet.add.optionDialog.restore.normalWallet.description',
    defaultMessage: '!!!If you have a recovery phrase consisting of {length} words, choose this option to restore your wallet.',
  },
  restorePaperWalletDescription: {
    id: 'wallet.add.optionDialog.restore.paperWallet.description',
    defaultMessage: '!!!If you have generated a Yoroi paper wallet (which is usually printed and kept offline), you can choose this option to import the funds from your Yoroi paper wallet.',
  },
});

type Props = {|
  +onCancel: void => void,
  +onRestore15: void => void,
  +onRestore24: void | (void => void),
|};

@observer
export default class WalletRestoreOptionDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const {
      onCancel,
      onRestore15,
      onRestore24,
    } = this.props;

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        closeOnOverlayClick={false}
        onClose={onCancel}
        closeButton={<DialogCloseButton />}
        className="WalletRestoreOptionDialog"
      >
        <div className={styles.component}>
          <ul className={styles.optionBlockList}>
            <OptionBlock
              parentName="WalletRestoreOptionDialog"
              type="restoreNormalWallet"
              title={intl.formatMessage(messages.restoreNormalTitle, { length: 15 })}
              learnMoreText={intl.formatMessage(messages.restoreNormalDescription, { length: 15 })}
              onSubmit={onRestore15}
            />
            {onRestore24 != null && (
              <OptionBlock
                parentName="WalletRestoreOptionDialog"
                type="normal24WordWallet"
                title={intl.formatMessage(messages.restoreNormalTitle, { length: 24 })}
                learnMoreText={intl.formatMessage(
                  messages.restoreNormalDescription, { length: 24 }
                )}
                onSubmit={onRestore24}
              />
            )}
          </ul>
        </div>
      </Dialog>
    );
  }
}

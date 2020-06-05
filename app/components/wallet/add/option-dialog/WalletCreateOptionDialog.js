// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import OptionBlock from '../../../widgets/options/OptionBlock';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from '../../../widgets/options/OptionListWrapperStyle.scss';
import globalMessages from '../../../../i18n/global-messages';
import environment from '../../../../environment';

const messages = defineMessages({
  createNormalDescription: {
    id: 'wallet.add.optionDialog.create.normalWallet.description',
    defaultMessage: '!!!A standard wallet backed by a recovery phrase.',
  },
  createPaperWalletDescription: {
    id: 'wallet.add.optionDialog.create.paperWallet.description',
    defaultMessage: '!!!Paper wallets can be created even on devices not connected to the internet which makes them well-suited for single-use cold storage.',
  },
});

type Props = {|
  +onCancel: void => void,
  +onPaper: void => void,
  +onCreate: void => void,
|};

@observer
export default class WalletCreateOptionDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { onCancel, onCreate, onPaper, } = this.props;

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.create)}
        closeOnOverlayClick={false}
        onClose={onCancel}
        closeButton={<DialogCloseButton />}
        className="WalletCreateOptionDialog"
      >
        <div className={styles.component}>
          <ul className={styles.optionBlockList}>
            <OptionBlock
              parentName="WalletCreateOptionDialog"
              type="createWallet"
              title={intl.formatMessage(globalMessages.createWalletLabel)}
              learnMoreText={intl.formatMessage(messages.createNormalDescription)}
              onSubmit={onCreate}
            />
            {!environment.isShelley() &&
              <OptionBlock
                parentName="WalletCreateOptionDialog"
                type="restorePaperWallet"
                title={intl.formatMessage(globalMessages.paperWalletLabel)}
                learnMoreText={intl.formatMessage(messages.createPaperWalletDescription)}
                onSubmit={onPaper}
              />
            }
          </ul>
        </div>
      </Dialog>
    );
  }
}

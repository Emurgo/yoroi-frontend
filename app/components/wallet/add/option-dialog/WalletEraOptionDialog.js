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
import DialogBackButton from '../../../widgets/DialogBackButton';

const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.add.optionDialog.walletEra.dialogTitle',
    defaultMessage: '!!!Choose era',
  },
  restoreByronEraWalletTitle: {
    id: 'wallet.add.optionDialog.walletEra.byronEra.title',
    defaultMessage: '!!!Byron-era (read-only) wallet',
  },
  restoreByronEraWalletDescription: {
    id: 'wallet.add.optionDialog.walletEra.byronEra.description',
    defaultMessage: '!!!Wallets created before July 29th, 2020 are Byron-era wallets and cannot delegate.',
  },
  restoreShelleyEraWalletTitle: {
    id: 'wallet.add.optionDialog.walletEra.shelleyEra.title',
    defaultMessage: '!!!Shelley-era wallet',
  },
  restoreShelleyEraWalletDescription: {
    id: 'wallet.add.optionDialog.walletEra.shelleyEra.description',
    defaultMessage: '!!!Shelley-era wallets support delegation to stake pools.',
  },
});

type Props = {|
  +onCancel: void => void,
  +onByron: void => void,
  +onShelley: void => void,
  +onBack: void => void,
|};

@observer
export default class WalletEraOptionDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        closeOnOverlayClick={false}
        onClose={this.props.onCancel}
        closeButton={<DialogCloseButton />}
        className="WalletEraOptionDialog"
        backButton={<DialogBackButton onBack={this.props.onBack} />}
      >
        <div className={styles.component}>
          <ul className={styles.optionBlockList}>
            <OptionBlock
              parentName="WalletEraOptionDialog"
              type="restoreNormalWallet"
              title={intl.formatMessage(messages.restoreByronEraWalletTitle)}
              learnMoreText={intl.formatMessage(messages.restoreByronEraWalletDescription)}
              onSubmit={this.props.onByron}
            />
            <OptionBlock
              parentName="WalletEraOptionDialog"
              type="restoreNormalWallet"
              title={intl.formatMessage(messages.restoreShelleyEraWalletTitle)}
              learnMoreText={intl.formatMessage(messages.restoreShelleyEraWalletDescription)}
              onSubmit={this.props.onShelley}
            />
          </ul>
        </div>
      </Dialog>
    );
  }
}

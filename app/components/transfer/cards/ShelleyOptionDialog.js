// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import Dialog from '../../widgets/Dialog';
import globalMessages from '../../../i18n/global-messages';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import OptionBlock from '../../widgets/options/OptionBlock';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from '../../widgets/options/OptionListWrapperStyle.scss';

const messages = defineMessages({
  recoveryPhrase: {
    id: 'transfer.rewards.regular.label',
    defaultMessage: '!!!Rewards from recovery phrase',
  },
  paperWallet: {
    id: 'transfer.rewards.paper.label',
    defaultMessage: '!!!Rewards from paper wallet',
  },
});

type Props = {|
  +onCancel: void => void,
  +onRegular: void => void,
  +onPaper: void => void,
|};

@observer
export default class ShelleyOptionDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.sidebarTransfer)}
        closeOnOverlayClick={false}
        onClose={this.props.onCancel}
        closeButton={<DialogCloseButton />}
        className={`${nameof(ShelleyOptionDialog)}`}
      >
        <div className={styles.component}>
          <ul className={styles.optionBlockList}>
            {/* TODO: support 24-word recovery phrase */}
            <OptionBlock
              parentName={`${nameof(ShelleyOptionDialog)}`}
              type="restoreNormalWallet"
              title={intl.formatMessage(messages.recoveryPhrase)}
              learnMoreText={intl.formatMessage(globalMessages.restoreShelleyEraWalletDescription)}
              onSubmit={this.props.onRegular}
            />
            <OptionBlock
              parentName={`${nameof(ShelleyOptionDialog)}`}
              type="restorePaperWallet"
              title={intl.formatMessage(messages.paperWallet)}
              learnMoreText={intl.formatMessage(globalMessages.restoreShelleyEraWalletDescription)}
              onSubmit={this.props.onPaper}
            />
          </ul>
        </div>
      </Dialog>
    );
  }
}

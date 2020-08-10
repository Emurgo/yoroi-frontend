// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';

import Dialog from '../../widgets/Dialog';
import globalMessages from '../../../i18n/global-messages';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import OptionBlock from '../../widgets/options/OptionBlock';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from '../../widgets/options/OptionListWrapperStyle.scss';
import { icarusMessages } from './ByronOptionDialog';

type Props = {|
  +onCancel: void => void,
  +onRegular: void => void,
  +onPaper: void => void,
|};

@observer
export default class ItnOptionDialog extends Component<Props> {
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
        className={`${nameof(ItnOptionDialog)}`}
      >
        <div className={styles.component}>
          <ul className={styles.optionBlockList}>
            <OptionBlock
              parentName={`${nameof(ItnOptionDialog)}`}
              type="bgByronMainnet"
              title={intl.formatMessage(icarusMessages.mnemonicLabel15)}
              learnMoreText={intl.formatMessage(globalMessages.legacyAttentionText)}
              onSubmit={this.props.onRegular}
            />
            <OptionBlock
              parentName={`${nameof(ItnOptionDialog)}`}
              type="bgShelleyMainnet"
              title={intl.formatMessage(icarusMessages.yoroiPaperLabel)}
              learnMoreText={intl.formatMessage(globalMessages.legacyAttentionText)}
              onSubmit={this.props.onPaper}
            />
          </ul>
        </div>
      </Dialog>
    );
  }
}

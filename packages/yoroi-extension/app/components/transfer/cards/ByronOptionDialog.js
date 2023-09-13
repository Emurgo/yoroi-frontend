// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import globalMessages from '../../../i18n/global-messages';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import OptionBlock from '../../widgets/options/OptionBlock';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { ComplexityLevelType } from '../../../types/complexityLevelType';

import styles from '../../widgets/options/OptionListWrapperStyle.scss';

const icarusMessages: * = defineMessages({
  transferText: {
    id: 'transfer.legacy.icarus.title',
    defaultMessage: '!!!Icarus/Yoroi Wallet',
  },
  yoroiPaperLabel: {
    id: 'yoroiTransfer.start.instructions.legacy-yoroiPaper',
    defaultMessage: '!!!Legacy Yoroi paper wallet',
  },
});

type Props = {|
  +icarus: {|
    +onPaper: void => void,
  |},
  +onCancel: void => void,
  +complexityLevel: ComplexityLevelType,
|};

@observer
export default class ByronOptionDialog extends Component<Props, State> {
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
        className="ByronOptionDialog"
      >
        <div className={styles.component}>
          <ul className={styles.optionBlockList}>
            {this.getIcarusTabContent()}
          </ul>
        </div>
      </Dialog>
    );
  }

  getIcarusTabContent: void => Node = () => {
    const { intl } = this.context;
    return (
      <>
        <OptionBlock
          parentName="fromIcarusPaperWallet"
          type="restorePaperWallet"
          onSubmit={this.props.icarus.onPaper}
          title={intl.formatMessage(icarusMessages.yoroiPaperLabel)}
          learnMoreText={intl.formatMessage(globalMessages.restoreByronEraWalletDescription)}
        />
      </>
    );
  }
}

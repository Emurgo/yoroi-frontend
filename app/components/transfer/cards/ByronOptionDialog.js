// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import globalMessages from '../../../i18n/global-messages';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import OptionBlock from '../../widgets/options/OptionBlock';

import styles from '../../widgets/options/OptionListWrapperStyle.scss';

const daedalusMessages = defineMessages({
  daedalusTabTitle: {
    id: 'transfer.legacy.daedalus.tab.title',
    defaultMessage: '!!!Legacy Daedalus',
  },
  fromLegacyDaedalus: {
    id: 'transfer.legacy.daedalus.title',
    defaultMessage: '!!!Legacy Daedalus wallet',
  },
  fromLegacyDaedalusPaper: {
    id: 'transfer.legacy.daedalusPaper.title',
    defaultMessage: '!!!Legacy Daedalus paper wallet',
  },
  fromLegacyDaedalusKey: {
    id: 'transfer.legacy.daedalusKey.title',
    defaultMessage: '!!!Legacy Daedalus master key',
  },
});

type Props = {|
  +daedalus: {|
    +onStandard: void => void,
    +onPaper: void => void,
    +onMaster: void => void,
  |},
  +yoroi: {|
    +onStandard: void => void,
    +onPaper: void => void,
  |},
  +hardware: {|
    +onTrezor: void => void,
    +onLedger: void => void,
  |},
  +onCancel: void => void,
|};

const tabOptions = Object.freeze({
  Daedalus: 0,
  Yoroi: 1,
  Hardware: 2,
});

type State = {|
  +selectedTab: $Values<typeof tabOptions>,
|};

@observer
export default class ByronOptionDialog extends Component<Props, State> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
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
          <div className={styles.tabsHeader}>
            <button
              type="button"
              className={`${styles.tabsLink} ${styles.active}`}>
              {'asdf'}
            </button>
            <button
              type="button"
              className={styles.tabsLink}>
              {'asdf'}
            </button>
          </div>
          <ul className={styles.optionBlockList}>
            {this.getDaedalusTabContent()}
          </ul>
        </div>
      </Dialog>
    );
  }

  getDaedalusTabContent: void => Node = () => {
    const { intl } = this.context;
    return (
      <>
        <OptionBlock
          parentName="ByronOptionDialog"
          type="legacyDaedalus"
          title={intl.formatMessage(daedalusMessages.fromLegacyDaedalus)}
          learnMoreText={intl.formatMessage(globalMessages.legacyAttentionText)}
          onSubmit={this.props.daedalus.onStandard}
        />
        <OptionBlock
          parentName="ByronOptionDialog"
          type="legacyDaedalus"
          onSubmit={this.props.daedalus.onPaper}
          title={intl.formatMessage(daedalusMessages.fromLegacyDaedalusPaper)}
          learnMoreText={intl.formatMessage(globalMessages.legacyAttentionText)}
        />
        <OptionBlock
          parentName="ByronOptionDialog"
          type="legacyDaedalus"
          onSubmit={this.props.daedalus.onMaster}
          title={intl.formatMessage(daedalusMessages.fromLegacyDaedalusKey)}
          learnMoreText={intl.formatMessage(globalMessages.legacyAttentionText)}
        />
      </>
    );
  }
}

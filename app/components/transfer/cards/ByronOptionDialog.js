// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import globalMessages from '../../../i18n/global-messages';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import OptionBlock from '../../widgets/options/OptionBlock';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { ComplexityLevelType } from '../../../types/complexityLevelType';
import { ComplexityLevels } from '../../../types/complexityLevelType';

import styles from '../../widgets/options/OptionListWrapperStyle.scss';

const daedalusMessages = defineMessages({
  transferText: {
    id: 'transfer.legacy.daedalus.title',
    defaultMessage: '!!!Legacy Daedalus Wallet',
  },
  transferPaperText: {
    id: 'daedalusTransfer.instructions.attention.paper.button.label',
    defaultMessage: '!!!Daedalus Paper Wallet',
  },
  transferMasterKeyText: {
    id: 'daedalusTransfer.instructions.attention.masterKey.button.label',
    defaultMessage: '!!!Daedalus Master Key',
  },
  fromLegacyDaedalus: {
    id: 'transfer.legacy.daedalus.12word',
    defaultMessage: '!!!12-word Daedalus wallet',
  },
});

const icarusMessages = defineMessages({
  transferText: {
    id: 'transfer.legacy.icarus.title',
    defaultMessage: '!!!Icarus/Yoroi Wallet',
  },
  mnemonicLabel15: {
    id: 'yoroiTransfer.start.instructions.mnemonic-15',
    defaultMessage: '!!!15-word recovery phrase',
  },
  yoroiPaperLabel: {
    id: 'yoroiTransfer.start.instructions.legacy-yoroiPaper',
    defaultMessage: '!!!Legacy Yoroi paper wallet',
  },
  legacyLedgerTitle: {
    id: 'yoroiTransfer.start.instructions.legacy-ledger',
    defaultMessage: '!!!Legacy Ledger Hardware Wallet',
  },
  legacyTrezorTitle: {
    id: 'yoroiTransfer.start.instructions.legacy-trezor',
    defaultMessage: '!!!Legacy Trezor Hardware Wallet',
  },
});

type Props = {|
  +daedalus: {|
    +onStandard: void => void,
    +onPaper: void => void,
    +onMaster: void => void,
  |},
  +icarus: {|
    +onStandard: void => void,
    +onPaper: void => void,
    +onTrezor: void => void,
    +onLedger: void => void,
  |},
  +onCancel: void => void,
  +complexityLevel: ComplexityLevelType,
|};

const TabOptions = Object.freeze({
  Daedalus: 0,
  Icarus: 1,
});

type State = {|
  +selectedTab: $Values<typeof TabOptions>,
|};

@observer
export default class ByronOptionDialog extends Component<Props, State> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    selectedTab: TabOptions.Daedalus,
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
          <div className={styles.tabsHeader}>
            <button
              type="button"
              onClick={() => this.setState({ selectedTab: TabOptions.Daedalus })}
              className={classnames(
                'DaedalusTab',
                styles.tabsLink,
                this.state.selectedTab === TabOptions.Daedalus ? styles.active : null
              )}
            >
              {intl.formatMessage(daedalusMessages.transferText)}
            </button>
            <button
              type="button"
              onClick={() => this.setState({ selectedTab: TabOptions.Icarus })}
              className={classnames(
                'IcarusTab',
                styles.tabsLink,
                this.state.selectedTab === TabOptions.Icarus ? styles.active : null
              )}
            >
              {intl.formatMessage(icarusMessages.transferText)}
            </button>
          </div>
          <ul className={styles.optionBlockList}>
            {this.state.selectedTab === TabOptions.Daedalus ? this.getDaedalusTabContent() : null}
            {this.state.selectedTab === TabOptions.Icarus ? this.getIcarusTabContent() : null}
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
          parentName="fromDaedalusWallet12Word"
          type="legacyDaedalus"
          title={intl.formatMessage(daedalusMessages.fromLegacyDaedalus)}
          learnMoreText={intl.formatMessage(globalMessages.legacyAttentionText)}
          onSubmit={this.props.daedalus.onStandard}
        />
        <OptionBlock
          parentName="fromDaedalusPaperWallet"
          type="legacyDaedalus"
          onSubmit={this.props.daedalus.onPaper}
          title={intl.formatMessage(daedalusMessages.transferPaperText)}
          learnMoreText={intl.formatMessage(globalMessages.legacyAttentionText)}
        />
        <OptionBlock
          parentName="fromDaedalusMasterKey"
          type="legacyDaedalus"
          onSubmit={this.props.daedalus.onMaster}
          title={intl.formatMessage(daedalusMessages.transferMasterKeyText)}
          learnMoreText={intl.formatMessage(globalMessages.legacyAttentionText)}
        />
      </>
    );
  }

  getIcarusTabContent: void => Node = () => {
    const { intl } = this.context;
    return (
      <>
        <OptionBlock
          parentName="fromIcarusWallet15Word"
          type="restoreNormalWallet"
          title={intl.formatMessage(icarusMessages.mnemonicLabel15)}
          learnMoreText={intl.formatMessage(globalMessages.legacyAttentionText)}
          onSubmit={this.props.icarus.onStandard}
        />
        <OptionBlock
          parentName="fromIcarusPaperWallet"
          type="restorePaperWallet"
          onSubmit={this.props.icarus.onPaper}
          title={intl.formatMessage(icarusMessages.yoroiPaperLabel)}
          learnMoreText={intl.formatMessage(globalMessages.legacyAttentionText)}
        />
        {this.props.complexityLevel === ComplexityLevels.Advanced && (
          <>
            <OptionBlock
              parentName="fromLedger"
              type="connectLedger"
              onSubmit={this.props.icarus.onLedger}
              title={intl.formatMessage(icarusMessages.legacyLedgerTitle)}
              learnMoreText={intl.formatMessage(globalMessages.legacyAttentionText)}
            />
            <OptionBlock
              parentName="fromTrezor"
              type="connectTrezor"
              onSubmit={this.props.icarus.onTrezor}
              title={intl.formatMessage(icarusMessages.legacyTrezorTitle)}
              learnMoreText={intl.formatMessage(globalMessages.legacyAttentionText)}
            />
          </>
        )}
      </>
    );
  }
}

// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import Dialog from '../../../widgets/Dialog';
import globalMessages from '../../../../i18n/global-messages';
import styles from './FinalizeDialog.scss';
import DialogBackButton from '../../../widgets/DialogBackButton';
import CopyableAddress from '../../../widgets/CopyableAddress';
import RawHash from '../../../widgets/hashWrappers/RawHash';
import type { AdaPaper } from '../../../../api/ada';
import WalletAccountIcon from '../../../topbar/WalletAccountIcon';
import ExplorableHashContainer from '../../../../containers/widgets/ExplorableHashContainer';
import type { ExplorerType } from '../../../../domain/Explorer';

const messages = defineMessages({
  dialogTitleFinalizePaper: {
    id: 'settings.paperWallet.dialog.finalize.title',
    defaultMessage: '!!!Yoroi Paper Wallet is created',
  },
  paperAccountIdLabel: {
    id: 'settings.paperWallet.dialog.paperAccountIdLabel',
    defaultMessage: '!!!Your Paper Wallet Account checksum:',
  },
  paperAddressesLabel: {
    id: 'settings.paperWallet.dialog.paperAddressesLabel',
    defaultMessage: '!!!Your Paper Wallet address[es]:',
  },
  paperFinalizeIntroLine1: {
    id: 'settings.paperWallet.dialog.finalize.intro.line1',
    defaultMessage: '!!!Make sure:',
  },
  paperFinalizeIntroLine2: {
    id: 'settings.paperWallet.dialog.finalize.intro.line2',
    defaultMessage: '!!!to <strong>keep the paper document</strong> and secret words safe.',
  },
  paperFinalizeIntroLine3: {
    id: 'settings.paperWallet.dialog.finalize.intro.line3',
    defaultMessage: '!!!to <strong>remember the password</strong>, or write it down and keep it safe!',
  },
});

type Props = {|
  onCopyAddress?: Function,
  onCopyAddressTooltip: Function,
  showNotification: Function,
  selectedExplorer: ExplorerType,
  paper: AdaPaper,
  onNext: Function,
  onCancel: Function,
  onBack?: Function,
  classicTheme: boolean,
|};

@observer
export default class FinalizeDialog extends Component<Props> {
  static defaultProps = {
    onBack: undefined,
    onCopyAddress: undefined,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      paper,
      onCancel,
      onNext,
      onBack,
      classicTheme,
      onCopyAddress,
      onCopyAddressTooltip,
      showNotification,
    } = this.props;

    const dialogClasses = classnames(['finalizeDialog', styles.dialog]);
    const confirmButtonClasses = classnames(['confirmButton']);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.finish),
        onClick: onNext,
        primary: true,
        className: confirmButtonClasses,
      },
    ];

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitleFinalizePaper)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={onCancel}
        className={dialogClasses}
        backButton={onBack && <DialogBackButton onBack={onBack} />}
        closeButton={<DialogCloseButton onClose={onCancel} />}
        classicTheme={classicTheme}
      >

        <span>{intl.formatMessage(messages.paperFinalizeIntroLine1)}</span><br />
        <ul>
          <li className={styles.smallTopMargin}>
            <span><FormattedHTMLMessage {...messages.paperFinalizeIntroLine2} /></span>
          </li>
          <li className={styles.smallTopMargin}>
            <span><FormattedHTMLMessage {...messages.paperFinalizeIntroLine3} /></span>
          </li>
        </ul>

        {paper.accountPlate ? (
          <div>
            <h2 className={styles.addressLabel}>
              {intl.formatMessage(messages.paperAccountIdLabel)}
            </h2>
            <div className={styles.plateRowDiv}>
              <WalletAccountIcon
                iconSeed={paper.accountPlate.hash}
              />
              <span className={styles.plateIdSpan}>{paper.accountPlate.id}</span>
            </div>
          </div>
        ) : ''}

        <div>
          <h2 className={styles.addressLabel}>
            {intl.formatMessage(messages.paperAddressesLabel)}
          </h2>
          {paper.addresses.map(a => (
            <CopyableAddress
              hash={a}
              onCopyAddress={onCopyAddressTooltip}
              showNotification={showNotification}
              tooltipOpensUpward={true}
              key={a}
            >
              <ExplorableHashContainer
                hash={a}
                selectedExplorer={this.props.selectedExplorer}
                light
                tooltipOpensUpward
                linkType="address"
              >
                <RawHash light>
                  {a}
                </RawHash>
              </ExplorableHashContainer>
            </CopyableAddress>
          ))}
          <div className={styles.postCopyMargin} />
        </div>

      </Dialog>
    );
  }

}

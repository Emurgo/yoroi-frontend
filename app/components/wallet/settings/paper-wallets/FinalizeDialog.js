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
import type { Notification } from '../../../../types/notificationType';

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
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  +selectedExplorer: ExplorerType,
  +paper: AdaPaper,
  +onNext: void => PossiblyAsync<void>,
  +onCancel: void => PossiblyAsync<void>,
  +onBack?: void => PossiblyAsync<void>,
|};

@observer
export default class FinalizeDialog extends Component<Props> {
  static defaultProps = {
    onBack: undefined,
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
      onCopyAddressTooltip,
      notification,
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
                iconSeed={paper.accountPlate.ImagePart}
              />
              <span className={styles.plateIdSpan}>{paper.accountPlate.TextPart}</span>
            </div>
          </div>
        ) : ''}

        <div>
          <h2 className={styles.addressLabel}>
            {intl.formatMessage(messages.paperAddressesLabel)}
          </h2>
          {paper.addresses.map((address, index) => {
            const notificationElementId = `${address}-${index}`;
            return (
              <CopyableAddress
                hash={address}
                elementId={notificationElementId}
                onCopyAddress={() => onCopyAddressTooltip(address, notificationElementId)}
                notification={notification}
                tooltipOpensUpward
                key={address}
              >
                <ExplorableHashContainer
                  hash={address}
                  selectedExplorer={this.props.selectedExplorer}
                  light
                  tooltipOpensUpward
                  linkType="address"
                >
                  <RawHash light>
                    {address}
                  </RawHash>
                </ExplorableHashContainer>
              </CopyableAddress>
            );
          })}
          <div className={styles.postCopyMargin} />
        </div>
      </Dialog>
    );
  }

}

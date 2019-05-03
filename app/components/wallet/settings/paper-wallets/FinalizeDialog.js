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
import SvgInline from 'react-svg-inline';
import recoveryWatchingSvg from '../../../../assets/images/recovery-watching.inline.svg';

const messages = defineMessages({
  dialogTitleFinalizePaper: {
    id: 'settings.paperWallet.dialog.finalize.title',
    defaultMessage: '!!!Yoroi Paper Wallet is created',
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

type Props = {
  onCopyAddress: Function,
  addresses: Array<string>,
  onNext: Function,
  onCancel: Function,
  onBack?: Function,
  classicTheme: boolean,
};

@observer
export default class FinalizeDialog extends Component<Props> {
  static defaultProps = {
    onBack: undefined
  }

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      addresses,
      onCancel,
      onNext,
      onBack,
      classicTheme,
      onCopyAddress,
    } = this.props;

    const dialogClasses = classnames(['finalizeDialog', styles.dialog]);
    const confirmButtonClasses = classnames(['confirmButton']);
    const addressClasses = classnames([
      styles.addressWrap
    ]);

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
        {!classicTheme && <SvgInline className={styles.recoveryImage} svg={recoveryWatchingSvg} />}

        <span>{intl.formatMessage(messages.paperFinalizeIntroLine1)}</span><br />
        <ul>
          <li className={styles.smallTopMargin}><span><FormattedHTMLMessage {...messages.paperFinalizeIntroLine2} /></span></li>
          <li className={styles.smallTopMargin}><span><FormattedHTMLMessage {...messages.paperFinalizeIntroLine3} /></span></li>
        </ul>

        <h2 className={styles.addressLabel}>
          {intl.formatMessage(messages.paperAddressesLabel)}
        </h2>
        {addresses.map(a => (
          <CopyableAddress
            address={a}
            isClassicThemeActive={classicTheme}
            onCopyAddress={onCopyAddress}
            isUsed={false}
            key={a}
          />
        ))}

      </Dialog>
    );
  }

}

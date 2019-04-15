// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import Dialog from '../../../widgets/Dialog';
import globalMessages from '../../../../i18n/global-messages';
import styles from './FinalizeDialog.scss';
import DialogBackButton from '../../../widgets/DialogBackButton';

const messages = defineMessages({
  dialogTitleFinalizePaper: {
    id: 'settings.paperWallet.dialog.finalize.title',
    defaultMessage: '!!!Yoroi Paper Wallet is created',
  },
  paperAddressesLabel: {
    id: 'settings.paperWallet.dialog.paperAddressesLabel',
    defaultMessage: '!!!Your Paper Wallet address[es]',
  },
  paperFinalizeIntroLine1: {
    id: 'settings.paperWallet.dialog.finalize.intro.line1',
    defaultMessage: '!!!You have successfully created and verified a Yoroi Paper Wallet!',
  },
  paperFinalizeIntroLine2: {
    id: 'settings.paperWallet.dialog.finalize.intro.line2',
    defaultMessage: '!!!Make sure to keep the paper document and secret words safe.',
  },
  paperFinalizeIntroLine3: {
    id: 'settings.paperWallet.dialog.finalize.intro.line3',
    defaultMessage: '!!!Make sure to REMEMBER THE PASSWORD, or write it down and keep it safe!',
  },
  paperFinalizeIntroLine4: {
    id: 'settings.paperWallet.dialog.finalize.intro.line4',
    defaultMessage: '!!!You can copy-paste the address[es] to have easy quick access to them without typing.',
  },
});

type Props = {
  addresses: Array<string>,
  onNext: Function,
  onCancel: Function,
  onBack?: Function,
};

@observer
export default class FinalizeDialog extends Component<Props> {
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
    } = this.props;

    console.log(addresses);

    const dialogClasses = classnames(['changePasswordDialog', styles.dialog]);
    const confirmButtonClasses = classnames(['confirmButton']);
    const largeTopMarginClasses = classnames([styles.largeTopMargin]);

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
        closeOnOverlayClick
        onClose={onCancel}
        className={dialogClasses}
        backButton={onBack && <DialogBackButton onBack={onBack} />}
        closeButton={<DialogCloseButton onClose={onCancel} />}
      >

        <div className={styles.headerBlock}>
          <span>{intl.formatMessage(messages.paperFinalizeIntroLine1)}</span><br />
          <span>{intl.formatMessage(messages.paperFinalizeIntroLine2)}</span><br />
          <span>{intl.formatMessage(messages.paperFinalizeIntroLine3)}</span><br />
          <span>{intl.formatMessage(messages.paperFinalizeIntroLine4)}</span><br />
        </div>

        <h2 className={largeTopMarginClasses}>
          {intl.formatMessage(messages.paperAddressesLabel)}
        </h2>
        <div className={styles.headerBlock}>
          {addresses.map(a => (
            <span>{a}<br /></span>
          ))}
        </div>

      </Dialog>
    );
  }

}

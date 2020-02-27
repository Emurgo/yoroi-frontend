// @flow
import React, { Component } from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import Dialog from '../../widgets/Dialog';
import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
import { CheckboxSkin } from 'react-polymorph/lib/skins/simple/CheckboxSkin';
import styles from './RemoveWalletDialog.scss';
import dangerousButtonStyles from '../../../themes/overrides/DangerousButton.scss';
import { messages } from './RemoveWallet';

const dialogMessages = defineMessages({
  warning2: {
    id: 'wallet.settings.delete.warning2',
    defaultMessage: '!!!Please double-check you still have the means to restore access to this wallet. If you cannot, removing the wallet may result in irreversible loss of funds.',
  },
  accept: {
    id: 'wallet.settings.delete.accept',
    defaultMessage: '!!!I still have the means to restore this wallet',
  },
});

type Props = {|
  +onSubmit: void => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +onCancel: void => void,
  +error: ?LocalizableError,
  +classicTheme: boolean,
|};

@observer
export default class RemoveWalletDialog extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  @observable isChecked: boolean = false;

  @action
  toggleCheck: void => void = () => {
    if (this.props.isSubmitting) return;
    this.isChecked = !this.isChecked;
  }

  render() {
    const { intl } = this.context;
    const {
      onCancel,
      isSubmitting,
      error,
      classicTheme,
    } = this.props;

    const dialogClasses = classnames(['removeWalletDialog', styles.dialog]);

    const confirmButtonClasses = classnames([
      'confirmButton',
      styles.removeButton,
      isSubmitting ? styles.isSubmitting : null,
    ]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.cancel),
        onClick: this.props.onCancel,
        primary: false,
        disabled: this.props.isSubmitting,
      },
      {
        label: intl.formatMessage(globalMessages.remove),
        onClick: this.props.onSubmit,
        primary: true,
        className: confirmButtonClasses,
        disabled: !this.isChecked ? true : undefined,
        themeOverrides: dangerousButtonStyles,
        isSubmitting: this.props.isSubmitting
      },
    ];

    return (
      <Dialog
        title={intl.formatMessage(messages.titleLabel)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={onCancel}
        className={dialogClasses}
        closeButton={<DialogCloseButton onClose={onCancel} />}
        classicTheme={classicTheme}
      >

        <p>{intl.formatMessage(messages.removeExplanation)}</p>
        <p>{intl.formatMessage(dialogMessages.warning2)}</p>

        <div className={styles.checkbox}>
          <Checkbox
            label={intl.formatMessage(dialogMessages.accept)}
            onChange={this.toggleCheck}
            checked={this.props.isSubmitting || this.isChecked}
            skin={CheckboxSkin}
          />
        </div>

        {error ? <p className={styles.error}>{intl.formatMessage(error)}</p> : null}

      </Dialog>
    );
  }

}

// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import moment from 'moment';
import LocalizableError from '../../i18n/LocalizableError';
import InlineEditingInput from '../widgets/forms/InlineEditingInput';
import ReadOnlyInput from '../widgets/forms/ReadOnlyInput';
import ChangeWalletPasswordDialog from './settings/ChangeWalletPasswordDialog';
import globalMessages from '../../i18n/global-messages';
import styles from './WalletSettings.scss';
import type { Node } from 'react';

export const messages = defineMessages({
  name: {
    id: 'wallet.settings.name.label',
    defaultMessage: '!!!Name',
    description: 'Label for the "Name" text input on the wallet settings page.',
  },
  passwordLabel: {
    id: 'wallet.settings.password',
    defaultMessage: '!!!Password',
    description: 'Label for the "Password" field.',
  },
  passwordLastUpdated: {
    id: 'wallet.settings.passwordLastUpdated',
    defaultMessage: '!!!Last updated',
    description: 'Last updated X time ago message.',
  },
  exportButtonLabel: {
    id: 'wallet.settings.exportWalletButtonLabel',
    defaultMessage: '!!!Export wallet',
    description: 'Label for the export button on wallet settings.',
  },
});

type Props = {
  walletName: string,
  walletPasswordUpdateDate: ?Date,
  error?: ?LocalizableError,
  openDialogAction: Function,
  isDialogOpen: Function,
  dialog: Node,
  onFieldValueChange: Function,
  onStartEditing: Function,
  onStopEditing: Function,
  onCancelEditing: Function,
  nameValidator: Function,
  activeField: ?string,
  isSubmitting: boolean,
  isInvalid: boolean,
  lastUpdatedField: ?string,
  showPasswordBlock: boolean,
};

@observer
export default class WalletSettings extends Component<Props> {
  static defaultProps = {
    error: undefined
  };
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  componentWillUnmount() {
    // This call is used to prevent display of old successfully-updated messages
    this.props.onCancelEditing();
  }

  render() {
    const { intl } = this.context;
    const {
      walletName,
      walletPasswordUpdateDate, error,
      openDialogAction, isDialogOpen,
      onFieldValueChange, onStartEditing,
      onStopEditing, onCancelEditing,
      nameValidator, activeField,
      isSubmitting, isInvalid,
      lastUpdatedField, dialog,
      showPasswordBlock
    } = this.props;
    const passwordMessage = (
      intl.formatMessage(messages.passwordLastUpdated, {
        lastUpdated: moment(walletPasswordUpdateDate).fromNow(),
      })
    );

    return (
      <div>
        <InlineEditingInput
          className="walletName"
          inputFieldLabel={intl.formatMessage(messages.name)}
          inputFieldValue={walletName}
          isActive={activeField === 'name'}
          onStartEditing={() => onStartEditing('name')}
          onStopEditing={onStopEditing}
          onCancelEditing={onCancelEditing}
          onSubmit={(value) => onFieldValueChange('name', value)}
          isValid={nameValidator}
          validationErrorMessage={intl.formatMessage(globalMessages.invalidWalletName)}
          successfullyUpdated={!isSubmitting && lastUpdatedField === 'name' && !isInvalid}
        />

        {showPasswordBlock &&
          <ReadOnlyInput
            label={intl.formatMessage(messages.passwordLabel)}
            value={passwordMessage}
            isSet
            onClick={() => openDialogAction({
              dialog: ChangeWalletPasswordDialog,
            })}
          />}

        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}

        {isDialogOpen(ChangeWalletPasswordDialog) ? (
          <div>{dialog}</div>
        ) : null}

      </div>
    );
  }

}

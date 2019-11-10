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

const messages = defineMessages({
  name: {
    id: 'wallet.settings.name.label',
    defaultMessage: '!!!Wallet name',
  },
  passwordLabel: {
    id: 'wallet.settings.password',
    defaultMessage: '!!!Spending password',
  },
  passwordLastUpdated: {
    id: 'wallet.settings.passwordLastUpdated',
    defaultMessage: '!!!Last updated',
  },
});

type Props = {|
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
  classicTheme: boolean,
|};

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
      showPasswordBlock, classicTheme,
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
          classicTheme={classicTheme}
        />

        {showPasswordBlock &&
          <ReadOnlyInput
            label={intl.formatMessage(messages.passwordLabel)}
            value={passwordMessage}
            isSet
            onClick={() => openDialogAction({
              dialog: ChangeWalletPasswordDialog,
            })}
            classicTheme={classicTheme}
          />}

        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}

        {isDialogOpen(ChangeWalletPasswordDialog) ? (
          <div>{dialog}</div>
        ) : null}

      </div>
    );
  }

}

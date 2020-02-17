// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import moment from 'moment';
import LocalizableError from '../../../i18n/LocalizableError';
import InlineEditingInput from '../../widgets/forms/InlineEditingInput';
import ReadOnlyInput from '../../widgets/forms/ReadOnlyInput';
import globalMessages from '../../../i18n/global-messages';
import styles from './WalletSettings.scss';

const messages = defineMessages({
  name: {
    id: 'wallet.settings.name.label',
    defaultMessage: '!!!Wallet name',
  },
  passwordLastUpdated: {
    id: 'wallet.settings.passwordLastUpdated',
    defaultMessage: '!!!Last updated',
  },
  unchangedPassword: {
    id: 'wallet.settings.unchangedPassword',
    defaultMessage: '!!!Password unchanged since wallet creation',
  },
});

type Props = {|
  +walletName: string,
  +walletPasswordUpdateDate: ?Date,
  +error?: ?LocalizableError,
  +openDialog: void => void,
  +isDialogOpen: any => boolean,
  +onFieldValueChange: (string, string) => PossiblyAsync<void>,
  +onStartEditing: string => void,
  +onStopEditing: void => void,
  +onCancelEditing: void => void,
  +nameValidator: string => boolean,
  +activeField: ?string,
  +isSubmitting: boolean,
  +isInvalid: boolean,
  +lastUpdatedField: ?string,
  +showPasswordBlock: boolean,
  +classicTheme: boolean,
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
      onFieldValueChange, onStartEditing,
      onStopEditing, onCancelEditing,
      nameValidator, activeField,
      isSubmitting, isInvalid,
      lastUpdatedField,
      showPasswordBlock, classicTheme,
    } = this.props;
    const passwordMessage = walletPasswordUpdateDate == null
      ? intl.formatMessage(messages.unchangedPassword)
      : (
        intl.formatMessage(messages.passwordLastUpdated, {
          lastUpdated: moment(walletPasswordUpdateDate).fromNow(),
        })
      );

    return (
      <>
        <InlineEditingInput
          className="walletName"
          inputFieldLabel={intl.formatMessage(messages.name)}
          inputFieldValue={walletName}
          isActive={activeField === 'name'}
          onStartEditing={() => onStartEditing('name')}
          onStopEditing={onStopEditing}
          onCancelEditing={onCancelEditing}
          onSubmit={async (value) => onFieldValueChange('name', value)}
          isValid={nameValidator}
          validationErrorMessage={intl.formatMessage(globalMessages.invalidWalletName)}
          successfullyUpdated={!isSubmitting && lastUpdatedField === 'name' && !isInvalid}
          classicTheme={classicTheme}
        />

        {showPasswordBlock &&
          <ReadOnlyInput
            label={intl.formatMessage(globalMessages.walletPasswordLabel)}
            value={passwordMessage}
            isSet
            onClick={this.props.openDialog}
            classicTheme={classicTheme}
          />}

        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}
      </>
    );
  }

}

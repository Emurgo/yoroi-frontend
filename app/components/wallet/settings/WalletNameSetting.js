// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import LocalizableError from '../../../i18n/LocalizableError';
import InlineEditingInput from '../../widgets/forms/InlineEditingInput';
import globalMessages from '../../../i18n/global-messages';
import styles from './WalletNameSetting.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  name: {
    id: 'wallet.settings.name.label',
    defaultMessage: '!!!Wallet name',
  },
});

type Props = {|
  +walletName: string,
  +error?: ?LocalizableError,
  +onFieldValueChange: (string, string) => PossiblyAsync<void>,
  +onStartEditing: string => void,
  +onStopEditing: void => void,
  +onCancelEditing: void => void,
  +nameValidator: string => boolean,
  +activeField: ?string,
  +isSubmitting: boolean,
  +isInvalid: boolean,
  +lastUpdatedField: ?string,
  +classicTheme: boolean,
|};

@observer
export default class WalletNameSetting extends Component<Props> {
  static defaultProps: {|error: void|} = {
    error: undefined
  };
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  componentWillUnmount(): void {
    // This call is used to prevent display of old successfully-updated messages
    this.props.onCancelEditing();
  }

  render(): Node {
    const { intl } = this.context;
    const {
      walletName,
      error,
      onFieldValueChange, onStartEditing,
      onStopEditing, onCancelEditing,
      nameValidator, activeField,
      isSubmitting, isInvalid,
      lastUpdatedField,
      classicTheme,
    } = this.props;
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
        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}
      </>
    );
  }
}

// @flow
import type { Node, ComponentType } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import LocalizableError from '../../../i18n/LocalizableError';
import InlineEditingInput from '../../widgets/forms/InlineEditingInput';
import globalMessages from '../../../i18n/global-messages';
import styles from './WalletNameSetting.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout } from '../../../styles/context/layout';
import type { InjectedLayoutProps } from '../../../styles/context/layout';
import { Box, Typography } from '@mui/material';

const messages = defineMessages({
  name: {
    id: 'wallet.settings.name.label',
    defaultMessage: '!!!Wallet name',
  },
  title: {
    id: 'wallet.settings.wallet.basics',
    defaultMessage: '!!!Basics',
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
class WalletNameSetting extends Component<Props & InjectedLayoutProps> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
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
      onFieldValueChange,
      onStartEditing,
      onStopEditing,
      onCancelEditing,
      nameValidator,
      isSubmitting,
      isInvalid,
      lastUpdatedField,
      classicTheme,
      isRevampLayout,
    } = this.props;
    return (
      <>
        {isRevampLayout && (
          <Typography component="div" variant="body1" fontWeight={500} mb="16px">
            {intl.formatMessage(messages.title)}
          </Typography>
        )}
        <Box sx={{ width: isRevampLayout ? '506px' : '100%' }}>
          <InlineEditingInput
            className="walletName"
            inputFieldLabel={intl.formatMessage(messages.name)}
            inputFieldValue={walletName}
            isActive={false}
            onStartEditing={() => onStartEditing('name')}
            onStopEditing={onStopEditing}
            onCancelEditing={onCancelEditing}
            onSubmit={async value => onFieldValueChange('name', value)}
            isValid={nameValidator}
            validationErrorMessage={intl.formatMessage(globalMessages.invalidWalletName)}
            successfullyUpdated={!isSubmitting && lastUpdatedField === 'name' && !isInvalid}
            classicTheme={classicTheme}
            id="settings:wallet:walletName"
          />
          {error && <div className={styles.error}>{intl.formatMessage(error, error.values)}</div>}
        </Box>
      </>
    );
  }
}

export default (withLayout(WalletNameSetting): ComponentType<Props>);

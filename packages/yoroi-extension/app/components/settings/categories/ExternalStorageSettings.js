// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { Button } from '@mui/material';
import type { SelectedExternalStorageProvider } from '../../../domain/ExternalStorage';
import type { ProvidersType } from '../../../api/externalStorage/index';
import styles from './ExternalStorageSettings.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout } from '../../../styles/context/layout';

const messages = defineMessages({
  sectionTitle: {
    id: 'settings.externalStorage.title',
    defaultMessage: '!!!Connect an account',
  },
  provider: {
    id: 'settings.externalStorage.provider',
    defaultMessage: '!!!Connect to {provider}',
  },
  sectionIntro: {
    id: 'settings.externalStorage.intro',
    defaultMessage:
      '!!!Select an external storage service to connect your account and save your memo notes.',
  },
  buttonDisconnect: {
    id: 'settings.externalStorage.button.disconnect',
    defaultMessage: '!!!Disconnect',
  },
});

type Props = {|
  onConnect: string => void,
  onDisconnect: void => Promise<void>,
  externalStorageProviders: { [key: string]: ProvidersType, ... },
  selectedExternalStorage: ?SelectedExternalStorageProvider,
|};

type InjectedProps = {| +isRevampLayout: boolean |};

@observer
class ExternalStorageSettings extends Component<Props & InjectedProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const {
      onConnect,
      onDisconnect,
      externalStorageProviders,
      selectedExternalStorage,
    } = this.props;
    const { intl } = this.context;
    const { isRevampLayout } = this.props;

    const providersButtons = [];
    for (const provider of Object.keys(externalStorageProviders)) {
      const authorizeUrl = externalStorageProviders[provider].authorizeUrl;
      const showDisconnect =
        selectedExternalStorage && selectedExternalStorage.provider === provider;
      const disabledCondition =
        selectedExternalStorage && selectedExternalStorage.provider !== provider;
      providersButtons.push(
        <Button
          key={provider}
          variant={isRevampLayout ? 'contained' : 'primary'}
          onClick={() => (showDisconnect === true ? onDisconnect() : onConnect(authorizeUrl))}
          disabled={disabledCondition}
          sx={{
            marginTop: '20px',
          }}
        >
          {showDisconnect === true
            ? intl.formatMessage(messages.buttonDisconnect)
            : intl.formatMessage(messages.provider, {
                provider: externalStorageProviders[provider].getDisplayName(),
              })}
        </Button>
      );
    }

    return (
      <div className={styles.component}>
        <h1>{this.context.intl.formatMessage(messages.sectionTitle)}</h1>
        <div>{this.context.intl.formatMessage(messages.sectionIntro)}</div>
        {providersButtons}
      </div>
    );
  }
}

export default (withLayout(ExternalStorageSettings): ComponentType<Props>);

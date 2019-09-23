// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import type { SelectedExternalStorageProvider } from '../../../domain/ExternalStorage';
import type { ProvidersType } from '../../../api/externalStorage/index';
import styles from './ExternalStorageSettings.scss';

const messages = defineMessages({
  sectionTitle: {
    id: 'settings.externalStorage.title',
    defaultMessage: '!!!Connect your account',
  },
  sectionIntro: {
    id: 'settings.externalStorage.intro',
    defaultMessage: '!!!Select an external storage service to connect your account and save your memo notes.'
  },
  buttonConnect: {
    id: 'settings.externalStorage.button.connect',
    defaultMessage: '!!!Connect',
  },
  buttonDisconnect: {
    id: 'settings.externalStorage.button.disconnect',
    defaultMessage: '!!!Disconnect',
  }
});

type Props = {|
  onConnect: Function,
  onDisconnect: Function,
  externalStorageProviders: { [key: string] : ProvidersType },
  selectedExternalStorage: ?SelectedExternalStorageProvider,
|};

@observer
export default class ExternalStorageSettings extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const {
      onConnect,
      onDisconnect,
      externalStorageProviders,
      selectedExternalStorage,
    } = this.props;
    const { intl } = this.context;

    const buttonClasses = classnames([
      'primary',
      styles.button
    ]);

    const providersButtons = [];
    // eslint-disable-next-line
    for (const provider in externalStorageProviders) {
      const authorizeUrl = externalStorageProviders[provider].authorizeUrl;
      const showDisconnect = (
        selectedExternalStorage
        && selectedExternalStorage.provider === provider
      );
      const disabledCondition = (
        selectedExternalStorage
        && selectedExternalStorage.provider !== provider
      );
      providersButtons.push(
        <Button
          key={provider}
          className={buttonClasses}
          label={showDisconnect ?
            intl.formatMessage(messages.buttonDisconnect) :
            // externalStorageProviders[provider].name
            intl.formatMessage(messages.buttonConnect)
          }
          skin={ButtonSkin}
          onClick={() => (showDisconnect ? onDisconnect() : onConnect(authorizeUrl))}
          disabled={disabledCondition}
        />
      );
    }

    return (
      <div className={styles.component}>
        <h1>{this.context.intl.formatMessage(messages.sectionTitle)}</h1>
        <p>{this.context.intl.formatMessage(messages.sectionIntro)}</p>
        {providersButtons}
      </div>
    );
  }

}

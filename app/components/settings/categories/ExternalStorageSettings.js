// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import type { SelectedExternalStorageProvider } from '../../../domain/ExternalStorage';
import type { ProvidersType } from '../../../api/externalStorage/index';
import styles from './ExternalStorageSettings.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

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
    defaultMessage: '!!!Select an external storage service to connect your account and save your memo notes.'
  },
  buttonDisconnect: {
    id: 'settings.externalStorage.button.disconnect',
    defaultMessage: '!!!Disconnect',
  }
});

type Props = {|
  onConnect: string => void,
  onDisconnect: void => Promise<void>,
  externalStorageProviders: { [key: string] : ProvidersType, ... },
  selectedExternalStorage: ?SelectedExternalStorageProvider,
|};

@observer
export default class ExternalStorageSettings extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
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

    const buttonClasses = classnames([
      'primary',
      styles.button
    ]);

    const providersButtons = [];
    for (const provider of Object.keys(externalStorageProviders)) {
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
          label={showDisconnect === true
            ? intl.formatMessage(messages.buttonDisconnect)
            : intl.formatMessage(
              messages.provider,
              { provider: externalStorageProviders[provider].getDisplayName() }
            )
          }
          skin={ButtonSkin}
          onClick={() => (showDisconnect === true ? onDisconnect() : onConnect(authorizeUrl))}
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

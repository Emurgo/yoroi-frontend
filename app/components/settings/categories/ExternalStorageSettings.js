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
  buttonDropbox: {
    id: 'settings.externalStorage.button.dropbox',
    defaultMessage: '!!!Dropbox',
  },
  buttonConnected: {
    id: 'settings.externalStorage.button.connected',
    defaultMessage: '!!!Connected',
  }
});

type Props = {|
  onExternalClick: Function,
  externalStorageProviders: { [key: string] : ProvidersType },
  selectedExternalStorage: ?SelectedExternalStorageProvider,
|};

@observer
export default class ExternalStorageSettings extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { onExternalClick, externalStorageProviders,
      selectedExternalStorage } = this.props;
    const { intl } = this.context;

    const buttonClasses = classnames([
      'primary',
      styles.button
    ]);

    const providersButtons = [];
    // eslint-disable-next-line
    for (const provider in externalStorageProviders) {
      const authorizeUrl = externalStorageProviders[provider].authorizeUrl;
      const disabledCondition = (
        selectedExternalStorage
        && selectedExternalStorage.provider === provider
      );
      providersButtons.push(
        <Button
          key={provider}
          className={buttonClasses}
          label={disabledCondition ?
            intl.formatMessage(messages.buttonConnected) :
            externalStorageProviders[provider].name
          }
          skin={ButtonSkin}
          onClick={() => onExternalClick(authorizeUrl)}
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

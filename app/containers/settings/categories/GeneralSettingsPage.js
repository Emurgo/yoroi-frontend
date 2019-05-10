// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import GeneralSettings from '../../../components/settings/categories/GeneralSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';
import ChangeWalletPasswordDialogContainer from './WalletSettingsPage';

@observer
export default class GeneralSettingsPage extends Component<InjectedProps> {

  onSelectLanguage = (values: { locale: string }) => {
    this.props.actions.profile.updateLocale.trigger(values);
  };

  render() {
    const { setProfileLocaleRequest, LANGUAGE_OPTIONS, currentLocale } = this.props.stores.profile;
    const isSubmitting = setProfileLocaleRequest.isExecuting;
    const { actions, stores } = this.props;
    const { uiDialogs } = stores;
    const changeDialog = (
      <ChangeWalletPasswordDialogContainer actions={actions} stores={stores} />
    );
    return (
      <GeneralSettings
        onSelectLanguage={this.onSelectLanguage}
        isSubmitting={isSubmitting}
        languages={LANGUAGE_OPTIONS}
        currentLocale={currentLocale}
        error={setProfileLocaleRequest.error}
        openDialogAction={actions.dialogs.open.trigger}
        isDialogOpen={uiDialogs.isOpen}
        dialog={changeDialog}
      />
    );
  }

}

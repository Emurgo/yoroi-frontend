// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import PaperWalletSettings from '../../../components/settings/categories/PaperWalletSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';

@observer
export default class PaperWalletPage extends Component<InjectedProps> {

  createPaperWallet = (values: { isCustomPassword: boolean, numAddresses: number }) => {
    const { isCustomPassword, numAddresses } = values;
    console.log('Creating paper: ', isCustomPassword, numAddresses);
  };

  render() {
    const { setProfileLocaleRequest, LANGUAGE_OPTIONS, currentLocale } = this.props.stores.profile;
    const isSubmitting = setProfileLocaleRequest.isExecuting;
    const { actions, stores } = this.props;
    const { uiDialogs } = stores;
    return (
      <PaperWalletSettings
        onCreatePaper={this.createPaperWallet}
        error={setProfileLocaleRequest.error}
      />
    );
  }

}

// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import LockScreenSettings from '../../../components/settings/categories/LockScreenSettings/LockScreenSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';

@observer
export default class GeneralSettingsPage extends Component<InjectedProps> {

  handleLockScreenToggle = (val: boolean = false) => {
    this.props.actions.profile.toggleLockScreen.trigger(val);
  };

  handleClose = () => {
    this.props.actions.profile.toggleLockScreen.trigger();
  }

  handleSubmit = (code: string) => {
    this.props.actions.profile.setPinCode.trigger(code);
  }

  render() {
    const {
      setLockScreenEnabledRequest,
      lockScreenEnabled,
      pinCode,
    } = this.props.stores.profile;
    const isSubmitting = setLockScreenEnabledRequest.isExecuting;
    return (
      <LockScreenSettings
        toggleLockScreen={this.handleLockScreenToggle}
        close={this.handleClose}
        isEnabled={lockScreenEnabled}
        isSubmitting={isSubmitting}
        error={setLockScreenEnabledRequest.error}
        pin={pinCode}
        submit={this.handleSubmit}
      />
    );
  }

}

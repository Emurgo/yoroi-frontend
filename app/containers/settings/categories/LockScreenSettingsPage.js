// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import LockScreenSettings from '../../../components/settings/categories/LockScreenSettings/LockScreenSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';

@observer
export default class GeneralSettingsPage extends Component<InjectedProps> {

  handleLockScreenToggle = () =>  {
    const { lockScreenEnabled } = this.props.stores.profile;
    this.props.actions.profile.toggleLockScreen.trigger(!lockScreenEnabled);
  };

  handleSubmit = (code: string) => {
    this.props.actions.profile.setPinCode.trigger(code);
  }

  render() {
    const {
      setLockScreenEnabledRequest,
      lockScreenEnabled,
      pinCode,
      pinCodeUpdateTime,
    } = this.props.stores.profile;
    return (
      <LockScreenSettings
        toggleLockScreen={this.handleLockScreenToggle}
        isEnabled={lockScreenEnabled}
        error={setLockScreenEnabledRequest.error}
        pin={pinCode}
        updated={pinCodeUpdateTime}
        submit={this.handleSubmit}
      />
    );
  }

}

// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import LockScreenSettings from '../../../components/settings/categories/LockScreenSettings/LockScreenSettings';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import LocalizableError from '../../../i18n/LocalizableError';

export type GeneratedData = typeof LockScreenSettingsPage.prototype.generated;

@observer
export default class LockScreenSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {

  handleLockScreenToggle: void => void = () =>  {
    const { lockScreenEnabled } = this.generated.stores.profile;
    this.generated.actions.profile.toggleLockScreen.trigger(!lockScreenEnabled);
  };

  handleSubmit: string => void = (code) => {
    this.generated.actions.profile.setPinCode.trigger(code);
  }

  render(): Node {
    const {
      setLockScreenEnabledRequest,
      lockScreenEnabled,
      pinCode,
      pinCodeUpdateTime,
    } = this.generated.stores.profile;
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

  @computed get generated(): {|
    actions: {|
      profile: {|
        setPinCode: {|
          trigger: (params: string) => Promise<void>
        |},
        toggleLockScreen: {|
          trigger: (params: boolean) => Promise<void>
        |},
      |},
    |},
    stores: {|
      profile: {|
        setLockScreenEnabledRequest: {|
          error: ?LocalizableError,
        |},
        lockScreenEnabled: boolean,
        pinCode: ?string,
        pinCodeUpdateTime: ?Date,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(LockScreenSettingsPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return {
      actions: {
        profile: {
          setPinCode: {
            trigger: actions.profile.setPinCode.trigger
          },
          toggleLockScreen: {
            trigger: actions.profile.toggleLockScreen.trigger
          },
        },
      },
      stores: {
        profile: {
          setLockScreenEnabledRequest: {
            error: stores.profile.setLockScreenEnabledRequest.error,
          },
          lockScreenEnabled: stores.profile.lockScreenEnabled,
          pinCode: stores.profile.pinCode,
          pinCodeUpdateTime: stores.profile.pinCodeUpdateTime,
        },
      },
    };
  }

}

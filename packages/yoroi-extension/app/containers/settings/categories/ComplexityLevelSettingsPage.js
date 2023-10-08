// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import ComplexityLevel from '../../../components/profile/complexity-level/ComplexityLevelForm';
import LocalizableError from '../../../i18n/LocalizableError';
import type { ComplexityLevelType } from '../../../types/complexityLevelType';
import type { ServerStatusErrorType } from '../../../types/serverStatusErrorType';

type GeneratedData = typeof ComplexityLevelSettingsPage.prototype.generated;

@observer
export default class ComplexityLevelSettingsPage extends Component<
  InjectedOrGenerated<GeneratedData>
> {
  render(): Node {
    return (
      <ComplexityLevel
        complexityLevel={this.generated.stores.profile.selectedComplexityLevel}
        onSubmit={this.generated.actions.profile.selectComplexityLevel.trigger}
        isSubmitting={this.generated.stores.profile.setComplexityLevelRequest.isExecuting}
        error={this.generated.stores.profile.setComplexityLevelRequest.error}
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      profile: {|
        selectComplexityLevel: {|
          trigger: (params: ComplexityLevelType) => Promise<void>,
        |},
      |},
    |},
    stores: {|
      profile: {|
        selectedComplexityLevel: ?ComplexityLevelType,
        setComplexityLevelRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
        |},
      |},
      serverConnectionStore: {|
        checkAdaServerStatus: ServerStatusErrorType,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ComplexityLevelSettingsPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const profileStore = stores.profile;

    return Object.freeze({
      stores: {
        serverConnectionStore: {
          checkAdaServerStatus: stores.serverConnectionStore.checkAdaServerStatus,
        },
        profile: {
          setComplexityLevelRequest: {
            error: profileStore.setComplexityLevelRequest.error,
            isExecuting: profileStore.setComplexityLevelRequest.isExecuting,
          },
          selectedComplexityLevel: profileStore.selectedComplexityLevel,
        },
      },
      actions: {
        profile: {
          selectComplexityLevel: { trigger: actions.profile.selectComplexityLevel.trigger },
        },
      },
    });
  }
}

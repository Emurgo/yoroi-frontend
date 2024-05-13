// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import ComplexityLevel from '../../../components/profile/complexity-level/ComplexityLevelForm';

@observer
export default class ComplexityLevelSettingsPage extends Component<StoresAndActionsProps> {
  render(): Node {
    return (
      <ComplexityLevel
        complexityLevel={this.props.stores.profile.selectedComplexityLevel}
        onSubmit={this.props.actions.profile.selectComplexityLevel.trigger}
        isSubmitting={this.props.stores.profile.setComplexityLevelRequest.isExecuting}
        error={this.props.stores.profile.setComplexityLevelRequest.error}
      />
    );
  }
}

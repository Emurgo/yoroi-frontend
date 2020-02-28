// @flow
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import TermsOfUseSettings from '../../../components/settings/categories/TermsOfUseSettings';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';

type GeneratedData = {|
  +stores: {|
    +profile: {|
      +termsOfUse: string,
    |},
  |},
|};

@observer
export default class TermsOfUseSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {

  @computed get generated(): GeneratedData {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(TermsOfUseSettingsPage)} no way to generated props`);
    }
    return Object.freeze({
      stores: {
        profile: {
          termsOfUse: this.props.stores.profile.termsOfUse,
        },
      },
    });
  }

  render() {
    const { termsOfUse } = this.generated.stores.profile;
    return (
      <TermsOfUseSettings
        localizedTermsOfUse={termsOfUse}
      />
    );
  }

}

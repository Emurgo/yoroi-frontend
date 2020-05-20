// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import TermsOfUseSettings from '../../../components/settings/categories/TermsOfUseSettings';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';

type GeneratedData = typeof TermsOfUseSettingsPage.prototype.generated;

@observer
export default class TermsOfUseSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {

  @computed get generated() {
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

  render(): Node {
    const { termsOfUse } = this.generated.stores.profile;
    return (
      <TermsOfUseSettings
        localizedTermsOfUse={termsOfUse}
      />
    );
  }
}

// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import { computed } from 'mobx';
import TermsOfUsePage from '../components/TermsOfUsePage';

type GeneratedData = typeof TermsOfUseContainer.prototype.generated;

@observer
export default class TermsOfUseContainer extends Component<InjectedOrGenerated<GeneratedData>> {
  render(): Node {
    return <TermsOfUsePage localizedTermsOfUse={this.generated.stores.profile.termsOfUse} />;
  }
  @computed get generated(): {|
    stores: {|
      profile: {|
        termsOfUse: string,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null) {
      throw new Error(`${nameof(TermsOfUseContainer)} no way to generated props`);
    }
    const { stores } = this.props;
    const profileStore = stores.profile;
    return Object.freeze({
      stores: {
        profile: {
          termsOfUse: profileStore.termsOfUse,
        },
      },
    });
  }
}

// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import TermsOfUseSettings from '../../../components/settings/categories/TermsOfUseSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';

@observer
export default class TermsOfUseSettingsPage extends Component<InjectedProps> {
  render(): Node {
    const { termsOfUse } = this.props.stores.profile;
    return <TermsOfUseSettings localizedTermsOfUse={termsOfUse} />;
  }
}

// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import TermsOfUseSettings from '../../../components/settings/categories/TermsOfUseSettings';
import type { StoresProps } from '../../../stores';

@observer
export default class TermsOfUseSettingsPage extends Component<StoresProps> {
  render(): Node {
    const { termsOfUse } = this.props.stores.profile;
    return <TermsOfUseSettings localizedTermsOfUse={termsOfUse} />;
  }
}

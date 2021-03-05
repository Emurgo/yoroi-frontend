// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import type { InjectedOrGeneratedConnector } from '../../types/injectedPropsType';
import { computed } from 'mobx';
import TermsOfUsePage from '../components/TermsOfUsePage';
import SettingLayout from '../components/layout/SettingLayout';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../i18n/global-messages';

type GeneratedData = typeof TermsOfUseContainer.prototype.generated;

type Props = {|
  ...InjectedOrGeneratedConnector<GeneratedData>,
  history: {
    goBack: void => void,
    ...
  },
|};
@observer
export default class TermsOfUseContainer extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };
  goBack: void => void = () => {
    this.props.history.goBack();
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <SettingLayout
        goBack={this.goBack}
        headerLabel={intl.formatMessage(globalMessages.termsOfUse)}
      >
        <TermsOfUsePage localizedTermsOfUse={this.generated.stores.profile.termsOfUse} />;
      </SettingLayout>
    );
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

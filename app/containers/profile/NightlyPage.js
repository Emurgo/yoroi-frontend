// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TopBarLayout from '../../components/layout/TopBarLayout';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import ProfleActions from '../../actions/profile-actions';
import NightlyForm from '../../components/profile/nightly/NightlyForm';

const messages = defineMessages({
  title: {
    id: 'profile.nightly.title',
    defaultMessage: '!!!Yoroi Nightly',
  },
});

type GeneratedData = {|
  +stores: {|
    +profile: {|
      +isClassicTheme: boolean,
    |},
  |},
  +actions: {|
    +profile: {|
      +acceptNightly: {|
        +trigger: typeof ProfleActions.prototype.acceptNightly.trigger
      |},
    |},
  |},
|};

@observer
export default class NightlyPage extends Component<InjectedOrGenerated<GeneratedData>> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  generateData: void => GeneratedData = () => {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(NightlyPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const profileStore = stores.profile;
    return {
      stores: {
        profile: {
          isClassicTheme: profileStore.isClassicTheme,
        },
      },
      actions: {
        profile: {
          acceptNightly: { trigger: actions.profile.acceptNightly.trigger },
        },
      },
    };
  }
  generated: GeneratedData = this.generateData();

  acceptNightly: void => void = () => {
    this.generated.actions.profile.acceptNightly.trigger();
  };

  renderPage(generated: GeneratedData) {
    const topBartitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topBar = (
      <TopBar
        title={topBartitle}
      />
    );
    return (
      <TopBarLayout
        topbar={topBar}
        banner={undefined}
      >
        <NightlyForm
          onSubmit={this.acceptNightly}
        />
      </TopBarLayout>
    );
  }

  render() {
    if (this.generated == null) return null;
    return this.renderPage(this.generated);
  }
}

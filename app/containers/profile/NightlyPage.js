// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TopBarLayout from '../../components/layout/TopBarLayout';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import NightlyForm from '../../components/profile/nightly/NightlyForm';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'profile.nightly.title',
    defaultMessage: '!!!Yoroi Nightly',
  },
});

type GeneratedData = typeof NightlyPage.prototype.generated;

@observer
export default class NightlyPage extends Component<InjectedOrGenerated<GeneratedData>> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  acceptNightly: void => void = () => {
    this.generated.actions.profile.acceptNightly.trigger();
  };

  renderPage(_generated: GeneratedData): Node {
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

  render(): Node {
    return this.renderPage(this.generated);
  }

  @computed get generated(): {|
    actions: {|profile: {|acceptNightly: {|trigger: (params: void) => void|}|}|},
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(NightlyPage)} no way to generated props`);
    }
    const { actions } = this.props;
    return Object.freeze({
      actions: {
        profile: {
          acceptNightly: { trigger: actions.profile.acceptNightly.trigger },
        },
      },
    });
  }
}

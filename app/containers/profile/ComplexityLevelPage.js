// @flow
import React, { Component } from 'react';
import TopBarLayout from '../../components/layout/TopBarLayout';
import TopBar from '../../components/topbar/TopBar';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import { defineMessages, intlShape } from 'react-intl';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import { computed } from 'mobx';
import { environment } from '../../environment';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import ComplexityLevel from '../../components/profile/complexity-level/ComplexityLevelForm';

const messages = defineMessages({
  title: {
    id: 'profile.complexityLevel.title',
    defaultMessage: '!!!Level of Interface Complexity',
  },
});

type GeneratedData = typeof ComplexityLevelPage.prototype.generated;
@observer
export default class ComplexityLevelPage extends Component<InjectedOrGenerated<GeneratedData>> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render() {

    const { checkAdaServerStatus } = this.generated.stores.serverConnectionStore;
    const displayedBanner = checkAdaServerStatus === ServerStatusErrors.Healthy ?
      <TestnetWarningBanner /> :
      <ServerErrorBanner errorType={checkAdaServerStatus} />;

    const topbarTitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );

    const topbarElement = (
      <TopBar
        title={topbarTitle}
      />);
    return (
      <TopBarLayout
        topbar={topbarElement}
        banner={displayedBanner}
      >
        <ComplexityLevel />
      </TopBarLayout>
    );
  }


  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ComplexityLevelPage)} no way to generated props`);
    }
    const { stores } = this.props;
    return Object.freeze({
      stores: {
        serverConnectionStore: {
          checkAdaServerStatus: stores.substores[environment.API]
            .serverConnectionStore.checkAdaServerStatus,
        },
      },
      actions: {
      },
    });
  }
}

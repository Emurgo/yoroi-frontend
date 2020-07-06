// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import TopBarLayout from '../../components/layout/TopBarLayout';
import TopBar from '../../components/topbar/TopBar';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import { defineMessages, intlShape } from 'react-intl';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import { computed } from 'mobx';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import ComplexityLevel from '../../components/profile/complexity-level/ComplexityLevelForm';
import type { ComplexityLevelType } from '../../types/complexityLevelType';
import type { ServerStatusErrorType } from '../../types/serverStatusErrorType';
import LocalizableError from '../../i18n/LocalizableError';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { isTestnet } from '../../api/ada/lib/storage/database/prepackaged/networks';

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

  render(): Node {

    const { checkAdaServerStatus } = this.generated.stores.serverConnectionStore;

    const { selected } = this.generated.stores.wallets;
    const isWalletTestnet = selected == null
      ? false
      : isTestnet(selected.getParent().getNetworkInfo());
    const displayedBanner = checkAdaServerStatus === ServerStatusErrors.Healthy
      ? <TestnetWarningBanner isTestnet={isWalletTestnet} />
      : <ServerErrorBanner errorType={checkAdaServerStatus} />;

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
        <ComplexityLevel
          complexityLevel={this.generated.stores.profile.complexityLevel}
          onSubmit={this.generated.actions.profile.selectComplexityLevel.trigger}
          isSubmitting={this.generated.stores.profile.setComplexityLevelRequest.isExecuting}
          error={this.generated.stores.profile.setComplexityLevelRequest.error}
        />
      </TopBarLayout>
    );
  }


  @computed get generated(): {|
    actions: {|
      profile: {|
        selectComplexityLevel: {| trigger: (params: ComplexityLevelType) => Promise < void > |}
      |}
    |},
    stores: {|
      wallets: {| selected: null | PublicDeriver<> |},
      profile: {|
        complexityLevel: ?ComplexityLevelType,
        setComplexityLevelRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean
        |}
      |},
      serverConnectionStore: {|
        checkAdaServerStatus: ServerStatusErrorType
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ComplexityLevelPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const profileStore = stores.profile;

    return Object.freeze({
      stores: {
        serverConnectionStore: {
          checkAdaServerStatus: stores.serverConnectionStore.checkAdaServerStatus,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        profile: {
          setComplexityLevelRequest: {
            error: profileStore.setComplexityLevelRequest.error,
            isExecuting: profileStore.setComplexityLevelRequest.isExecuting,
          },
          complexityLevel: profileStore.selectedComplexityLevel
        },
      },
      actions: {
        profile: {
          selectComplexityLevel: { trigger: actions.profile.selectComplexityLevel.trigger },
        },
      },
    });
  }
}

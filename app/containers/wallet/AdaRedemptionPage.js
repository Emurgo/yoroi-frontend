// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import type { InjectedProps } from '../../types/injectedPropsType';
import TextOnlyTopBar from '../../components/layout/TextOnlyTopbar';
import resolver from '../../utils/imports';

const MainLayout = resolver('containers/MainLayout');

const messages = defineMessages({
  title: {
    id: 'wallet.redeem.dialog.title',
    defaultMessage: '!!!Ada Redemption',
    description: 'Headline "Ada redemption" dialog.'
  },
});

@inject('stores', 'actions') @observer
export default class AdaRedemptionPage extends Component<InjectedProps> {
  static defaultProps = { actions: null, stores: null };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { stores, actions } = this.props;
    const { sidebar } = stores;

    const topBar = (
      <TextOnlyTopBar
        title={this.context.intl.formatMessage(messages.title)}
        onCategoryClicked={category => {
          actions.sidebar.activateSidebarCategory.trigger({ category });
        }}
        categories={sidebar.CATEGORIES}
        activeSidebarCategory={sidebar.activeSidebarCategory}
      />
    );

    return (
      <MainLayout topbar={topBar}>
        Ada Redeem page
      </MainLayout>
    );
  }
}

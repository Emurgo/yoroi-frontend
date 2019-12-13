// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';

import environment from '../../environment';
import type { InjectedProps } from '../../types/injectedPropsType';
import MainLayout from '../MainLayout';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import NoticeBoard from '../../components/notice-board/NoticeBoard';
import NoNotice from '../../components/notice-board/NoNotice';

const messages = defineMessages({
  title: {
    id: 'noticeBoard.topbar.title',
    defaultMessage: '!!!Notification',
  },
});

type Props = InjectedProps;

@observer
export default class NoticeBoardPage extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { actions, stores } = this.props;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const { noticeBoard, topbar, profile } = stores;

    const topbarTitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topbarComp = (
      <TopBar
        title={topbarTitle}
        onCategoryClicked={category => {
          actions.topbar.activateTopbarCategory.trigger({ category });
        }}
        isActiveCategory={topbar.isActiveCategory}
        categories={topbar.categories}
      />
    );
    const hasAny = noticeBoard.loadedNotices.length > 0;

    return (
      <MainLayout
        topbar={topbarComp}
        actions={actions}
        stores={stores}
        connectionErrorType={checkAdaServerStatus}
      >
        {hasAny ? (
          <NoticeBoard
            loadedNotices={noticeBoard.loadedNotices}
            hasMoreToLoad={noticeBoard.hasMoreToLoad}
            isLoading={noticeBoard.isLoading}
            onLoadMore={() => actions.noticeBoard.loadMore.trigger()}
          />
        ) : (
          <NoNotice classicTheme={profile.isClassicTheme} />
        )}
      </MainLayout>
    );
  }
}

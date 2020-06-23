// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape, defineMessages } from 'react-intl';

import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import type { GeneratedData as BannerContainerData } from '../banners/BannerContainer';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import NoticeBoard from '../../components/notice-board/NoticeBoard';
import NoNotice from '../../components/notice-board/NoNotice';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import Notice from '../../domain/Notice';
import type { GetNoticesRequestOptions } from '../../api/ada/index';

const messages = defineMessages({
  title: {
    id: 'noticeBoard.topbar.title',
    defaultMessage: '!!!Notification',
  },
});


type GeneratedData = typeof NoticeBoardPage.prototype.generated;

@observer
export default class NoticeBoardPage extends Component<InjectedOrGenerated<GeneratedData>> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const {
      loadedNotices,
      searchOptions,
      isLoading,
      hasMoreToLoad,
    } = this.generated.stores.noticeBoard;

    const topbarTitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topbarComp = (
      <TopBar
        title={topbarTitle}
      />
    );
    const hasAny = loadedNotices.length > 0;

    let noticeComp = null;
    if (searchOptions) {
      if (hasAny) {
        noticeComp = (
          <NoticeBoard
            loadedNotices={loadedNotices}
            hasMoreToLoad={hasMoreToLoad}
            isLoading={isLoading}
            onLoadMore={() => this.generated.actions.noticeBoard.loadMore.trigger()}
          />
        );
      } else  {
        noticeComp = (<NoNotice classicTheme={this.generated.stores.profile.isClassicTheme} />);
      }
    }

    return (
      <TopBarLayout
        banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
        topbar={topbarComp}
      >
        {noticeComp}
      </TopBarLayout>
    );
  }

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    actions: {|
      noticeBoard: {|
        loadMore: {|
          trigger: (params: void) => Promise<void>
        |}
      |},
    |},
    stores: {|
      noticeBoard: {|
        hasMoreToLoad: boolean,
        isLoading: boolean,
        loadedNotices: Array<Notice>,
        searchOptions: GetNoticesRequestOptions
      |},
      profile: {| isClassicTheme: boolean |},
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(NoticeBoardPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const profileStore = stores.profile;
    return Object.freeze({
      stores: {
        profile: {
          isClassicTheme: profileStore.isClassicTheme,
        },
        noticeBoard: {
          loadedNotices: stores.noticeBoard.loadedNotices,
          searchOptions: stores.noticeBoard.searchOptions,
          isLoading: stores.noticeBoard.isLoading,
          hasMoreToLoad: stores.noticeBoard.hasMoreToLoad,
        },
      },
      actions: {
        noticeBoard: {
          loadMore: { trigger: actions.noticeBoard.loadMore.trigger },
        },
      },
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}

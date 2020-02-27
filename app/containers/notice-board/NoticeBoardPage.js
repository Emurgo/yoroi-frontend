// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape, defineMessages } from 'react-intl';

import environment from '../../environment';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import MainLayout from '../MainLayout';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import NoticeBoard from '../../components/notice-board/NoticeBoard';
import NoNotice from '../../components/notice-board/NoNotice';
import type { ServerStatusErrorType } from '../../types/serverStatusErrorType';
import type { Category } from '../../config/topbarConfig';
import TopbarActions from '../../actions/topbar-actions';
import NoticeActions from '../../actions/notice-board-actions';
import Notice from '../../domain/Notice';
import type {
  GetNoticesRequestOptions
} from '../../api/ada';

const messages = defineMessages({
  title: {
    id: 'noticeBoard.topbar.title',
    defaultMessage: '!!!Notification',
  },
});


type GeneratedData = {|
  +stores: {|
    +profile: {|
      +isClassicTheme: boolean,
    |},
    +serverConnectionStore: {|
      +checkAdaServerStatus: ServerStatusErrorType,
    |},
    topbar: {|
      +isActiveCategory: Category => boolean,
      +categories: Array<Category>,
    |},
    +noticeBoard: {|
      +loadedNotices: Array<Notice>,
      +searchOptions: GetNoticesRequestOptions,
      +isLoading: boolean,
      +hasMoreToLoad: boolean,
    |},
  |},
  +actions: {|
    +topbar: {|
      +activateTopbarCategory: {|
        +trigger: typeof TopbarActions.prototype.activateTopbarCategory.trigger,
      |},
    |},
    +noticeBoard: {|
      +loadMore: {|
        +trigger: typeof NoticeActions.prototype.loadMore.trigger,
      |},
    |},
  |},
|};

@observer
export default class NoticeBoardPage extends Component<InjectedOrGenerated<GeneratedData>> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  @computed get generated(): GeneratedData {
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
        serverConnectionStore: {
          checkAdaServerStatus: stores.substores[environment.API]
            .serverConnectionStore.checkAdaServerStatus,
        },
        topbar: {
          isActiveCategory: stores.topbar.isActiveCategory,
          categories: stores.topbar.categories,
        },
        noticeBoard: {
          loadedNotices: stores.noticeBoard.loadedNotices,
          searchOptions: stores.noticeBoard.searchOptions,
          isLoading: stores.noticeBoard.isLoading,
          hasMoreToLoad: stores.noticeBoard.hasMoreToLoad,
        },
      },
      actions: {
        topbar: {
          activateTopbarCategory: { trigger: actions.topbar.activateTopbarCategory.trigger },
        },
        noticeBoard: {
          loadMore: { trigger: actions.noticeBoard.loadMore.trigger },
        },
      },
    });
  }

  render() {
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
        onCategoryClicked={category => {
          this.generated.actions.topbar.activateTopbarCategory.trigger({ category });
        }}
        isActiveCategory={this.generated.stores.topbar.isActiveCategory}
        categories={this.generated.stores.topbar.categories}
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
      <MainLayout
        topbar={topbarComp}
        connectionErrorType={this.generated.stores.serverConnectionStore.checkAdaServerStatus}
      >
        {noticeComp}
      </MainLayout>
    );
  }
}

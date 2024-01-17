// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';

import type { StoresAndActionsProps } from '../../types/injectedPropsType';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import NoticeBoard from '../../components/notice-board/NoticeBoard';
import NoNotice from '../../components/notice-board/NoNotice';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { getTokenName, genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../utils/formatters';

const messages = defineMessages({
  title: {
    id: 'noticeBoard.topbar.title',
    defaultMessage: '!!!Notification',
  },
});

@observer
export default class NoticeBoardPage extends Component<StoresAndActionsProps> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { actions, stores } = this.props;
    const {
      loadedNotices,
      searchOptions,
      isLoading,
      hasMoreToLoad,
    } = this.props.stores.noticeBoard;

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
            onLoadMore={() => this.props.actions.noticeBoard.loadMore.trigger()}
          />
        );
      } else  {
        const { selected } = this.props.stores.wallets;
        if (selected == null) {
          throw new Error(`${nameof(NoticeBoardPage)} not handled yet`);
        }
        const defaultToken = selected.getParent().getDefaultToken();
        const defaultTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)({
          identifier: defaultToken.defaultIdentifier,
          networkId: defaultToken.defaultNetworkId,
        });
        noticeComp = (
          <NoNotice
            classicTheme={this.props.stores.profile.isClassicTheme}
            ticker={truncateToken(getTokenName(defaultTokenInfo))}
          />
        );
      }
    }

    return (
      <TopBarLayout
        banner={(<BannerContainer actions={actions} stores={stores} />)}
        topbar={topbarComp}
      >
        {noticeComp}
      </TopBarLayout>
    );
  }
}

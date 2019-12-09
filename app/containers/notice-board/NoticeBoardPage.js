// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';

import environment from '../../environment';
import type { InjectedProps } from '../../types/injectedPropsType';
import MainLayout from '../MainLayout';
import TopBarContainer from '../TopBarContainer';

import NoticeBoard from '../../components/notice-board/NoticeBoard';

type Props = InjectedProps;

@observer
export default class NoticeBoardPage extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { actions, stores } = this.props;
    const topbarContainer = (<TopBarContainer actions={actions} stores={stores} />);
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const { noticeBoard } = stores;

    return (
      <MainLayout
        topbar={topbarContainer}
        actions={actions}
        stores={stores}
        connectionErrorType={checkAdaServerStatus}
      >
        <NoticeBoard
          loadedNotices={noticeBoard.loadedNotices}
          allLoaded={noticeBoard.allLoaded}
        />
      </MainLayout>
    );
  }
}

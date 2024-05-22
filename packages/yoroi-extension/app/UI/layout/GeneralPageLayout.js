// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import { observer } from 'mobx-react';
import { intlShape, injectIntl } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../../containers/banners/BannerContainer';
import SidebarContainer from '../../containers/SidebarContainer';
import { Box, Typography } from '@mui/material';
import { withLayout } from '../../styles/context/layout';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ModalProvider } from '../context/ModalContext';

type Props = {|
  ...StoresAndActionsProps,
  +children?: Node,
  navbar?: Node,
|};

type LayoutProps = {|
  stores: any,
  actions: any,
  children?: Node,
  navbar?: Node,
  intl: $npm$ReactIntl$IntlFormat,
|};

@observer
class GeneralPageLayout extends Component<LayoutProps> {
  render() {
    const { children, actions, navbar, stores, intl } = this.props;
    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;

    return (
      // TODO ModalProvider to be moved into APP after finish refactoring and bring everything in UI
      <ModalProvider>
        <TopBarLayout
          banner={<BannerContainer actions={actions} stores={stores} />}
          sidebar={sidebarContainer}
          navbar={navbar}
        >
          {children}
        </TopBarLayout>
      </ModalProvider>
    );
  }
}

export default (withLayout(GeneralPageLayout): ComponentType<Props>);

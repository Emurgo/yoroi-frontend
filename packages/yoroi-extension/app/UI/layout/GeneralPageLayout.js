// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import { observer } from 'mobx-react';
import { intlShape, injectIntl } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../../containers/banners/BannerContainer';
import SidebarContainer from '../../containers/SidebarContainer';
import { withLayout } from '../../styles/context/layout';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ModalProvider } from '../components/modals/ModalContext';
import { ModalManager } from '../components/modals/ModalManager';
import { IntlProvider } from '../context/IntlProvider';

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

type InjectedLayoutProps = {|
  +renderLayoutComponent: any => Node,
|};

type AllProps = {| ...Props, ...InjectedLayoutProps |};

@observer
class GeneralPageLayout extends Component<LayoutProps> {
  static defaultProps: {| children: void |} = {
    children: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render() {
    const { children, actions, navbar, stores } = this.props;
    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;
    const { intl } = this.context;

    return (
      <IntlProvider intl={intl}>
        <ModalProvider>
          <ModalManager />
          <TopBarLayout banner={<BannerContainer actions={actions} stores={stores} />} sidebar={sidebarContainer} navbar={navbar}>
            {children}
          </TopBarLayout>
        </ModalProvider>
      </IntlProvider>
    );
  }
}

export default (withLayout(GeneralPageLayout): ComponentType<Props>);

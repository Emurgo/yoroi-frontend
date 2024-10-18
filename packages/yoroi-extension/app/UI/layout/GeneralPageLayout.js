import { observer } from 'mobx-react';
import * as React from 'react';
import { intlShape } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../../containers/banners/BannerContainer';
import SidebarContainer from '../../containers/SidebarContainer';
import { ModalProvider } from '../components/modals/ModalContext';
import { ModalManager } from '../components/modals/ModalManager';
import { IntlProvider } from '../context/IntlProvider';

@observer
export default class GeneralPageLayout extends React.Component {
  static defaultProps = {
    children: undefined,
  };

  static contextTypes = {
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

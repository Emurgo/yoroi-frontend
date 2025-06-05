import { ReactNode } from 'react';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import { useIntl } from '../../context/IntlProvider';
import { connectorMessages } from '../../../i18n/global-messages';

type Props = {
  stores: any;
  children: ReactNode;
};

const DappCenterLayout = ({ stores, children }: Props): JSX.Element => {
  const { intl } = useIntl();
  return (
    <GeneralPageLayout
      stores={stores}
      navbar={
        <NavBarContainerRevamp
          stores={stores}
          title={<NavBarTitle title={intl.formatMessage(connectorMessages.dappConnector)} />}
        />
      }
    >
      {children}
    </GeneralPageLayout>
  );
};

export default DappCenterLayout;

import React from 'react';
import { observer } from 'mobx-react';
import { connectorMessages } from '../../../../i18n/global-messages';
import { Tabs, TabItem } from '../../../components/tabs/Tabs';
import { useIntl } from '../../../context/IntlProvider';
import environment from '../../../../environment';

interface Props {
  connectionContent: React.ReactNode;
  utxosContent: React.ReactNode;
  detailsContent: React.ReactNode;
  isDataSignin: boolean;
}

const SignTxTabs = observer(({ connectionContent, utxosContent, detailsContent, isDataSignin }: Props) => {
  const isTestEnv = environment.isNightly() || environment.isTest();
  const containerHeight = isTestEnv ? 'calc(100vh - 306px - 46px)' : 'calc(100vh - 306px)';

  const { intl } = useIntl();

  const tabs: TabItem[] = [
    {
      id: 'details',
      label: intl.formatMessage({ id: 'connector.signIn.tabs.details', defaultMessage: '!!!Details' }),
      content: detailsContent,
    },
    {
      id: 'utxos',
      label: intl.formatMessage({ id: 'connector.signIn.tabs.utxos', defaultMessage: '!!!UTxOs' }),
      content: utxosContent,
    },
    {
      id: 'connection',
      label: intl.formatMessage({ id: 'connector.signIn.tabs.connection', defaultMessage: '!!!Connection' }),
      content: connectionContent,
    },
  ];

  return (
    <Tabs
      title={intl.formatMessage(connectorMessages[isDataSignin ? 'signData' : 'signTransaction'])}
      tabs={tabs}
      containerHeight={containerHeight}
    />
  );
});

export default SignTxTabs;

import React from 'react';
import { styled } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ReactComponent as YoroiLogo } from '../../../../connector/assets/images/yoroi-logo.inline.svg';
import { ReactComponent as DappConnectorIcon } from '../../../../../assets/images/dapp-connector/dapp-connector.inline.svg';
import { TestnetWarningBanner } from '../../../../../components/topbar/banners/TestnetWarningBanner';
import { environment } from '../../../../../environment';
import type { LayoutProps } from '../../types/layout';

const Container = styled('div')({
  width: '480px',
  minHeight: '100vh',
  borderRadius: '2px',
  backgroundColor: 'var(--yoroi-palette-gray-50)',
  boxShadow: '0 2px 5px 3px rgba(0, 0, 0, 0.06)',
  fontWeight: 400,
  margin: '0 auto',
  '@media screen and (min-width: 1441px)': {
    width: '640px',
  },
});

const Header = styled('div')({
  height: '56px',
  background: 'linear-gradient(30.09deg, #244abf 0%, #4760ff 176.73%)',
  display: 'flex',
  alignItems: 'center',
  padding: '16px 32px',
});

const Menu = styled('div')({
  margin: '0 auto',
  paddingRight: '24px',
  color: '#fff',
  display: 'flex',
  '& svg': {
    width: '24px',
    height: '24px',
  },
});

const Logo = styled('div')({
  display: 'flex',
  alignItems: 'center',
  marginLeft: '12px',
  '& h3': {
    fontSize: '16px',
    fontWeight: 500,
    letterSpacing: 0,
    lineHeight: '19px',
    textTransform: 'capitalize',
  },
});

const ConnectorLogoContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

const ConnectorLogo = styled(DappConnectorIcon)({
  width: '20px',
  height: '20px',
  marginLeft: '10px',
});

const Content = styled('div')({
  position: 'relative',
});

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isTestnet = environment.isTest();

  return (
    <Container>
      <TestnetWarningBanner isTestnet={isTestnet} />
      <Header>
        <Menu>
          <YoroiLogo />
          <Logo>
            <h3>
              <FormattedMessage id="global.connector.yoroiDappConnector" />
            </h3>
          </Logo>
          <ConnectorLogoContainer>
            <ConnectorLogo />
          </ConnectorLogoContainer>
        </Menu>
      </Header>
      <Content>{children}</Content>
    </Container>
  );
};

export default Layout; 
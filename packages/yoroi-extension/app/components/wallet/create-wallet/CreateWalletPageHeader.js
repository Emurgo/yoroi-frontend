// @flow
import type { Node, ComponentType } from 'react';
import { Box, Typography, styled } from '@mui/material';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import { ReactComponent as YoroiLogo } from '../../../assets/images/yoroi-logo-shape-blue.inline.svg';

const messages: * = defineMessages({
  title: {
    id: 'wallet.create.page.title',
    defaultMessage: '!!!Create a Wallet',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {||};

const LogoIconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& defs': {
      '& linearGradient': {
        '& stop': {
          'stop-color': theme.palette.ds.el_primary_medium,
        },
      },
    },
  },
}));

function CreateWalletPageHeader(props: Props & Intl): Node {
  const { intl } = props;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ width: '56px', height: '48px', mb: '38px' }}>
        <LogoIconWrapper>
          <YoroiLogo />
        </LogoIconWrapper>
      </Box>
      <Typography component="div" variant="h3" fontWeight={500} color="ds.text_gray_medium">
        {intl.formatMessage(messages.title)}
      </Typography>
    </Box>
  );
}

export default (injectIntl(CreateWalletPageHeader): ComponentType<Props>);

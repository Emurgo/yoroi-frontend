// @flow
import type { Node, ComponentType } from 'react';
import { Box, Typography } from '@mui/material';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import YoroiLogo from '../../../assets/images/yoroi-logo-shape-blue.inline.svg';

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
        <img src={YoroiLogo} alt="Yoroi" title="Yoroi" />
      </Box>
      <Typography component="div" variant="h3" fontWeight={500}>
        {intl.formatMessage(messages.title)}
      </Typography>
    </Box>
  );
}

export default (injectIntl(CreateWalletPageHeader): ComponentType<Props>);

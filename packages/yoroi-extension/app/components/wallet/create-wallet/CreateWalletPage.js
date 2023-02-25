// @flow
import { useEffect, useState } from 'react';
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import SaveRecoveryPhraseTipsDialog from './SaveRecoveryPhraseTipsDialog';
import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import YoroiLogo from '../../../assets/images/yoroi-logo-shape-blue.inline.svg'

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

function CreateWalletPage(props: Props & Intl): Node {
  const { intl } = props;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true)
  }, [])

  return (
    <Box>
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

        <Typography variant='h3'>{intl.formatMessage(messages.title)}</Typography>
      </Box>

      <SaveRecoveryPhraseTipsDialog
        open={open}
        onClose={() => setOpen(false)}
      />
    </Box>
  );
}


export default (injectIntl(observer(CreateWalletPage)) : ComponentType<Props> )
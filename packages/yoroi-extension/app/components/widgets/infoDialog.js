// @flow
import Fade from '@mui/material/Fade';
import { Dialog, Typography, Button, Stack, Link } from '@mui/material';
import React from 'react';
import type { Node, ComponentType } from 'react';
import { Box } from '@mui/system';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { observer } from 'mobx-react';

export const messages: Object = defineMessages({
  dialogTitle: {
    id: 'wallet.infoDialog.title',
    defaultMessage: '!!!Tips',
  },
  learnMore: {
    id: 'wallet.infoDialog.learnMore',
    defaultMessage: '!!!Learn more on Yoroi Zendesk',
  },
});

type Props = {|
  open: boolean,
  children: Node,
  onClose(): void,
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const Transition = React.forwardRef((props, ref) => {
  return <Fade timeout={500} ref={ref} {...props} />;
});

function InfoDialog(props: Props & Intl): Node {
  const { open, onClose, children, intl } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      sx={{
        background: 'ds.web_overlay',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '& .MuiPaper-root': {
          background: 'none',
          maxWidth: 'unset',
        },
      }}
      id="infoDialog"
    >
      <Box
        sx={{
          width: '648px',
          background: 'var(--yoroi-palette-common-white)',
          borderRadius: '8px',
          boxShadow: '0px 13px 20px -1px rgba(0, 0, 0, 0.15)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'grey.200',
          padding: '24px',
          display: 'flex',
          alignitems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography
          component="div"
          sx={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '500',
            lineHeight: '22px',
            textTransform: 'uppercase',
            textAlign: 'center',
            mb: '25px',
          }}
        >
          {intl.formatMessage(messages.dialogTitle)}
        </Typography>
        <Box
          sx={{
            flex: 1,
          }}
        >
          {children}
        </Box>
        <Link
          href="https://emurgohelpdesk.zendesk.com/hc/en-us/categories/4412619927695-Yoroi-"
          target="_blank"
          rel="noreferrer noopener"
          sx={{
            textDecoration: 'none',
            display: 'block',
            textAlign: 'center',
            py: '24px',
          }}
        >
          {intl.formatMessage(messages.learnMore)}
        </Link>
        <Stack alignItems="center" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            disableRipple={false}
            onClick={onClose}
            sx={{
              width: '176px',
            }}
            id="infoDialogContinueButton"
          >
            {intl.formatMessage(globalMessages.continue)}
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}

export default (injectIntl(observer(InfoDialog)): ComponentType<Props>);

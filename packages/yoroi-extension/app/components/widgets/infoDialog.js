// @flow
import { Modal, Typography, Button, Stack } from '@mui/material';
import type { Node, ComponentType } from 'react';
import { Box } from '@mui/system';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import globalMessages from '../../i18n/global-messages';

const messages: Object = defineMessages({
    dialogTitle: {
        id: 'wallet.infoDialog.title',
        defaultMessage: '!!!Tips',
    },
})

type Props = {|
    open: bolean,
    children: Node,
|}

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

function InfoDialog(props: Props & Intl): Node {
   const { open, children, intl } = props;

   return (
     <Modal
       open={open}
       sx={{
        background: 'var(--yoroi-comp-dialog-overlay-background-color)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '& .MuiBackdrop-root': {
          background: 'none',
        },
      }}
     >
       <Box
         sx={{
            width: '648px',
            minHeight: '415px',
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
         <Stack alignItems='center' justifyContent='center'>
           <Button
             variant='rv-primary'
             disableRipple={false}
             sx={{
               width: '176px',
               height: '40px',
               fontSize: '14px',
               lineHeight: '15px',
             }}
           >
             {intl.formatMessage(globalMessages.continue)}
           </Button>
         </Stack>
       </Box>
     </Modal>
   )
}

export default (injectIntl(InfoDialog): ComponentType<Props>)
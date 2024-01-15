// @flow
import type { Node, ComponentType } from 'react';
import InfoDialog from '../../widgets/infoDialog';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Typography, Box } from '@mui/material';
import { observer } from 'mobx-react';

const messages: Object = defineMessages({
  title: {
    id: 'wallet.create.dialog.walletChecksum.title',
    defaultMessage: '!!!What is wallet checksum and plate number?',
  },
  firstTip: {
    id: 'wallet.create.dialog.walletChecksum.firstTip', // todo: update it
    defaultMessage:
      '!!!{plateImg} Wallet checksum is a generic Blockie image that is generated to visually distinguish your wallet from others.',
  },
  secondTip: {
    id: 'wallet.create.dialog.walletChecksum.secondTip',
    defaultMessage:
      '!!!Plate number <strong>{plateText}</strong> is a auto-generated sign of four letters and four digits.',
  },
  thirdTip: {
    id: 'wallet.create.dialog.walletChecksum.thirdTip',
    defaultMessage:
      '!!!Checksum and plate number are unique to your wallet and represent your public key.',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  open: boolean,
  onClose(): void,
  plateTextPart: string,
  plateImagePart: Node,
|};

function WalletChecksumTipsDialog(props: Props & Intl): Node {
  const { open, onClose, intl, plateImagePart, plateTextPart } = props;

  return (
    <InfoDialog open={open} onClose={onClose}>
      <Typography component="div" textAlign="center" variant="body1" fontWeight="500" mb="16px">
        {intl.formatMessage(messages.title)}
      </Typography>
      <Box component="ul" sx={{ listStyle: 'outside', px: '24px' }}>
        <Box component="li">
          <Typography component="div" variant="body1" color="grey.800">
            <FormattedMessage
              {...messages.firstTip}
              values={{
                plateImg: (
                  <Box component="span" display="inline-block" width="24px" position="relative">
                    <Box sx={{ position: 'absolute', top: '-18px', left: '0px' }}>
                      {plateImagePart}
                    </Box>
                  </Box>
                ),
              }}
            />
          </Typography>
        </Box>
        <Box component="li">
          <Typography component="div" variant="body1" color="grey.800">
            <FormattedHTMLMessage {...messages.secondTip} values={{ plateText: plateTextPart }} />
          </Typography>
        </Box>
        <Box component="li">
          <Typography component="div" variant="body1" color="grey.800">
            {intl.formatMessage(messages.thirdTip)}
          </Typography>
        </Box>
      </Box>
    </InfoDialog>
  );
}

export default (injectIntl(observer(WalletChecksumTipsDialog)): ComponentType<Props>);

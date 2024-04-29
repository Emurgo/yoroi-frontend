// @flow
import type { Node, ComponentType } from 'react';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import { injectIntl, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { observer } from 'mobx-react';
import { Resolver } from '@yoroi/types';
import { resolveAddressDomainNameServerName } from '../../stores/ada/AdaAddressesStore';
import DialogCloseButton from '../../components/widgets/Dialog/DialogCloseButton';
import { CloseButton } from '../../components/widgets/Dialog/Dialog';
import { listValues, sorted } from '../../coreUtils';

type Props = {|
  onClose: () => void,
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages = defineMessages({
  title: {
    id: 'wallet.send.form.receiver.supportedAddressDomainsBanner.title',
    defaultMessage: '!!!Yoroi supports more addresses',
  },
  message: {
    id: 'wallet.send.form.receiver.supportedAddressDomainsBanner.message',
    defaultMessage:
      '!!!Yoroi offers a unique chance to use custom and lightning-fast alternatives to the traditional wallet address, such as:',
  },
});

function SupportedAddressDomainsBanner({ onClose, intl }: Props & Intl): Node {
  const nameServerNames = sorted(
    listValues<string>(Resolver.NameServer).map(resolveAddressDomainNameServerName)
  );
  return (
    <Box>
      <Box
        sx={{
          background: theme => theme.palette.gradients.bg_gradient_1,
          borderRadius: '8px',
          overflowY: 'hidden',
          position: 'relative',
          padding: '16px',
          paddingTop: '12px',
        }}
        id="walletEmptyBanner"
      >
        <CloseButton
          onClose={onClose}
          closeButton={<DialogCloseButton isRevampLayout />}
          sx={{
            right: '4px',
            top: '4px',
          }}
        />
        <Box>
          <Typography
            component="div"
            color="common.black"
            fontWeight={500}
            fontSize="16px"
            mb="8px"
          >
            {intl.formatMessage(messages.title)}
          </Typography>
          <Typography component="div" color="common.black" fontWeight={400} fontSize="16px">
            {intl.formatMessage(messages.message)}
          </Typography>
          <Typography component="div" fontWeight={500} paddingLeft="10px">
            {nameServerNames.map((name, idx) => (
              <>
                <span>• {name}</span>
                {idx < nameServerNames.length - 1 ? <br /> : null}
              </>
            ))}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default (injectIntl(observer(SupportedAddressDomainsBanner)): ComponentType<Props>);

// @flow
import type { Node, ComponentType } from 'react';
import { Box } from '@mui/system';
import { Button, Stack, Typography } from '@mui/material';
import { injectIntl, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { observer } from 'mobx-react';
import { Resolver } from '@yoroi/types';
import { resolveAddressDomainNameServerName } from '../../stores/ada/AdaAddressesStore';
import DialogCloseButton from '../../components/widgets/DialogCloseButton';
import { CloseButton } from '../../components/widgets/Dialog';
import { listValues } from '../../coreUtils';

type Props = {|
  onClose: () => void,
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages = defineMessages({
  title: {
    id: 'wallet.send.form.receiver.supportedAddressDomainsBanner.title',
    defaultMessage: '!!!Yoroi supports',
  },
});

function SupportedAddressDomainsBanner({ onClose, intl }: Props & Intl): Node {
  const nameServerNames = listValues<string>(Resolver.NameServer).map(resolveAddressDomainNameServerName);
  nameServerNames.sort();
  return (
    <Box>
      <Box
        sx={{
          background: theme => theme.palette.background.gradients.supportedAddressDomainsBanner,
          borderRadius: '8px',
          overflowY: 'hidden',
          position: 'relative',
          padding: '24px',
        }}
        id='walletEmptyBanner'
      >
        <CloseButton
          onClose={onClose}
          closeButton={<DialogCloseButton isRevampLayout />}
        />
        <Box>
          <Typography component="div" variant="h4" color="common.black" fontWeight={500} mb="8px">
            {intl.formatMessage(messages.title)}:
          </Typography>
          <Typography component="div" variant="body1" color="common.black" maxWidth="500px">
            {nameServerNames.map((name, idx) => (
              <><span>• {name}</span>{idx < nameServerNames.length-1 ? (<br />) : null}</>
            ))}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default (injectIntl(observer(SupportedAddressDomainsBanner)): ComponentType<Props>);

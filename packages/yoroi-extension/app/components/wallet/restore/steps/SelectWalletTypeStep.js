// @flow
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Typography, Box } from '@mui/material';
import StepController from '../StepController';
import fifteenImg from '../../../../assets/images/add-wallet/restore/15-word.inline.svg';
import twentyfourImg from '../../../../assets/images/add-wallet/restore/24-word.inline.svg';
import AddWalletCard from '../../add-wallet-revamp/AddWalletCard';

const messages: * = defineMessages({
  fifteenWords: {
    id: 'wallet.restore.type.fifteen',
    defaultMessage: '!!!15-word recovery phrase',
  },
  twentyfourWords: {
    id: 'wallet.restore.type.twentyfour',
    defaultMessage: '!!!24-word recovery phrase',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  onNext(step: string): void,
|};

function SelectWalletTypeStep(props: Props & Intl): Node {
  const { onNext, intl } = props;

  return (
    <Stack alignItems="center" justifyContent="center">
      <Stack direction="column" alignItems="center" justifyContent="center" maxWidth="648px">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: '24px',
            mt: '24px',
          }}
        >
          <AddWalletCard
            onClick={() => console.log('15 selected')}
            imageSrc={fifteenImg}
            label={intl.formatMessage(messages.fifteenWords)}
          />
          <AddWalletCard
            onClick={() => console.log('24 selected')}
            imageSrc={twentyfourImg}
            label={intl.formatMessage(messages.twentyfourWords)}
          />
        </Box>

        <StepController goBack={() => console.log('go back')} showNextButton={false} />
      </Stack>
    </Stack>
  );
}

export default (injectIntl(observer(SelectWalletTypeStep)): ComponentType<Props>);

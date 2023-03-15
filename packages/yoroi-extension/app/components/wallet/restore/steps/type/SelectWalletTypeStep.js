// @flow
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Typography, Box } from '@mui/material';
import StepController from '../../StepController';
import fifteenImg from '../../../../../assets/images/add-wallet/restore/15-word.inline.svg';
import twentyfourImg from '../../../../../assets/images/add-wallet/restore/24-word.inline.svg';
import AddWalletCard from '../../../add-wallet-revamp/AddWalletCard';
import styles from './SelectWalletTypeStep.scss';

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
  onNext(numWords: number): void,
|};

function SelectWalletTypeStep(props: Props & Intl): Node {
  const { onNext, intl } = props;

  return (
    <Stack alignItems="center" justifyContent="center">
      <Stack direction="column" alignItems="center" justifyContent="center" maxWidth="648px">
        <Box className={styles.container}>
          <AddWalletCard
            onClick={() => onNext(15)}
            imageSx={{ pt: '10px' }}
            imageSrc={fifteenImg}
            label={intl.formatMessage(messages.fifteenWords)}
          />
          <AddWalletCard
            onClick={() => onNext(24)}
            imageSx={{ pt: '10px' }}
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

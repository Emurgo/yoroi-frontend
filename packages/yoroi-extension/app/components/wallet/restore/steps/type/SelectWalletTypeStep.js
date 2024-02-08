// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import type { RestoreModeType } from '../../../../../actions/common/wallet-restore-actions';
import { defineMessages, injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import { Stack, Box } from '@mui/material';
import StepController from '../../../create-wallet/StepController';
import fifteenImg from '../../../../../assets/images/add-wallet/restore/15-word.inline.svg';
import twentyfourImg from '../../../../../assets/images/add-wallet/restore/24-word.inline.svg';
import AddWalletCard from '../../../add-wallet-revamp/AddWalletCard';
import styles from './SelectWalletTypeStep.scss';
import globalMessages from '../../../../../i18n/global-messages';

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
  onNext: RestoreModeType => void,
  goBack: void => void,
|};

function SelectWalletTypeStep(props: Props & Intl): Node {
  const { onNext, goBack, intl } = props;

  return (
    <Stack alignItems="center" justifyContent="center">
      <Stack direction="column" alignItems="center" justifyContent="center" maxWidth="648px">
        <Box className={styles.container} id="selectWalletTypeStepBox">
          <AddWalletCard
            onClick={() => onNext({ type: 'cip1852', extra: undefined, length: 15 })}
            imageSrc={fifteenImg}
            label={intl.formatMessage(messages.fifteenWords)}
            id="fifteenWordsButton"
          />
          <AddWalletCard
            onClick={() => onNext({ type: 'cip1852', extra: undefined, length: 24 })}
            imageSrc={twentyfourImg}
            label={intl.formatMessage(messages.twentyfourWords)}
            id="twentyfourWordsButton"
          />
        </Box>
        <Box mt="74px">
          <StepController
            actions={[
              {
                label: intl.formatMessage(globalMessages.backButtonLabel),
                disabled: false,
                onClick: goBack,
                type: 'secondary',
              },
            ]}
          />
        </Box>
      </Stack>
    </Stack>
  );
}

export default (injectIntl(observer(SelectWalletTypeStep)): ComponentType<Props>);

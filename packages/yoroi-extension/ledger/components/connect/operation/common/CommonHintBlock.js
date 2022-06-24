// @flow //
import React from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';

import type {
  DeviceCodeType,
  ProgressStateType
}  from '../../../../types/enum';
import HintBlock from '../../../widgets/hint/HintBlock';
import HintGap from '../../../widgets/hint/HintGap';

import styles from './CommonHintBlock.scss';

const message = defineMessages({
  sPinCode: {
    id: 'hint.common.pinCode',
    defaultMessage: '!!!If your Ledger device is locked enter your PIN, using the <strong>right</strong> and <strong>left</strong> buttons to select each number and then <strong>both</strong> buttons to confirm.'
  },
  sCardanoApp: {
    id: 'hint.common.CardanoApp',
    defaultMessage: '!!!Highlight the <strong>Cardano ADA</strong> app on your Ledger and press <strong>both</strong> buttons.'
  },
  xPinCode: {
    id: 'hint.common.pinCode',
    defaultMessage: '!!!If your Ledger device is locked enter your PIN, using the <strong>right</strong> and <strong>left</strong> buttons to select each number and then <strong>both</strong> buttons to confirm.'
  },
  xCardanoApp: {
    id: 'hint.common.CardanoApp',
    defaultMessage: '!!!Highlight the <strong>Cardano ADA</strong> app on your Ledger and press <strong>both</strong> buttons.'
  },
});

type Props = {|
  deviceCode: DeviceCodeType,
  progressState: ProgressStateType,
|};

@observer
export default class CommonHintBlock extends React.Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };

  render() {
    const {
      deviceCode,
    } = this.props;

    const imgCommon1 = require(`../../../../assets/img/nano-${deviceCode}/hint-common-1.png`);
    const imgCommon2 = require(`../../../../assets/img/nano-${deviceCode}/hint-common-2.png`);

    return (
      <div className={styles.component}>
        <div className={styles.stepsRow}>
          <HintBlock
            number={1}
            text={message[`${deviceCode}PinCode`]}
            imagePath={imgCommon1}
          />
          <HintGap />
          <HintBlock
            number={2}
            text={message[`${deviceCode}CardanoApp`]}
            imagePath={imgCommon2}
          />
        </div>
      </div>
    );
  }
}

// @flow //
import React from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';

import type { DeviceCodeType } from '../../../../types/enum';
import HintBlock from '../../../widgets/hint/HintBlock';
import { getAddressHintBlock } from '../../../widgets/hint/AddressHintBlock';
import HintGap from '../../../widgets/hint/HintGap';
import type {
  DeriveAddressRequest,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import styles from './DeriveAddressHintBlock.scss';

const message = defineMessages({
  sInfo: {
    id: 'hint.verifyAddress.info',
    defaultMessage: '!!!Check your Ledger screen, then press <strong>both</strong> buttons.'
  },
  sExport: {
    id: 'hint.export',
    defaultMessage: '!!!Confirm exporting the address by pressing the <strong>right</strong> button.'
  },
  xInfo: {
    id: 'hint.verifyAddress.info',
    defaultMessage: '!!!Check your Ledger screen, then press <strong>both</strong> buttons.'
  },
  xExport: {
    id: 'hint.export',
    defaultMessage: '!!!Confirm exporting the address by pressing the <strong>right</strong> button.'
  },
});

type Props = {|
  deviceCode: DeviceCodeType,
  deriveAddressInfo: DeriveAddressRequest,
  wasDeviceLocked: boolean
|};

@observer
export default class DeriveAddressHintBlock extends React.Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };

  render() {
    const {
      deviceCode,
      deriveAddressInfo,
      wasDeviceLocked
    } = this.props;

    const stepStartNumber: number = wasDeviceLocked ? 2 : 0; // 2 = count of common step
    const imgExport1 = require(`../../../../assets/img/nano-${deviceCode}/hint-export-address.png`);
    const imgExport2 = require(`../../../../assets/img/nano-${deviceCode}/hint-export-address-confirm.png`);

    let stepNumber = stepStartNumber;
    const getAndIncrementStep = () => {
      return ++stepNumber;
    };
    const content = (
      <div className={styles.stepsRow}>
        <HintBlock
          number={++stepNumber}
          text={message[`${deviceCode}Info`]}
          imagePath={imgExport1}
        />
        <HintGap />
        {getAddressHintBlock({
          deviceCode,
          getAndIncrementStep,
          addressInfo: deriveAddressInfo.address,
        })}
        <HintBlock
          number={++stepNumber}
          text={message[`${deviceCode}Export`]}
          imagePath={imgExport2}
        />
        <HintGap />
      </div>
    );

    return (
      <div className={styles.component}>
        {content}
      </div>
    );
  }
}

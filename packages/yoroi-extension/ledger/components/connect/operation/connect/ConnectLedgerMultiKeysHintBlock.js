// @flow //
// For now, we assume the only use case is to export 2 public keys.
import React from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';

import type { DeviceCodeType }  from '../../../../types/enum';
import HintBlock from '../../../widgets/hint/HintBlock';
import HintGap from '../../../widgets/hint/HintGap';

import styles from './ConnectLedgerHintBlock.scss';

const message = defineMessages({
  sConfirmExportPublicKey: {
    id: 'hint.connect.confirmExportPublicKey',
    defaultMessage: '!!!Confirm exporting the public key by pressing <strong>right</strong> button.'
  },
  xConfirmExportPublicKey: {
    id: 'hint.nanoX.connect.confirmExportPublicKey',
    defaultMessage: '!!!Confirm exporting the public key by pressing <strong>both</strong> buttons.'
  },
});

type Props = {|
  deviceCode: DeviceCodeType,
  wasDeviceLocked: boolean,
|};

@observer
export default class ConnectLedgerHintBlock extends React.Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };

  render() {
    const {
      deviceCode,
      wasDeviceLocked
    } = this.props;

    const stepStartNumber: number = wasDeviceLocked ? 2 : 0; // 2 = count of common step
    const imgConnect = require(`../../../../assets/img/nano-${deviceCode}/hint-connect-2-keys.svg`).default;

    const content = (
      <div className={styles.stepsRow}>
        <HintBlock
          number={stepStartNumber + 1}
          text={message[`${deviceCode}ConfirmExportPublicKey`]}
          imagePath={imgConnect}
        />
      </div>
    );

    return (
      <div className={styles.component}>
        {content}
      </div>
    );
  }
}

// @flow //
import React from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import yoroiIcon from '../../../../assets/img/yoroi.svg';
import hardwareWalletsIllustration from '../../../../assets/img/illustration-hardware-extension.svg';
import styles from './SignMessageBlock.scss';
import type { DeviceCodeType }  from '../../../../types/enum';

const messages = defineMessages({
  confirm: {
    id: 'sign.data.confirm',
    defaultMessage: '!!!Confirm on your hardware wallet'
  },
  instruction1: {
    id: 'sign.data.instruction1',
    defaultMessage: '!!!Take your hardware wallet device and follow the instructions there.'
  },
  instruction2: {
    id: 'sign.data.instruction2',
    defaultMessage: '!!!Make sure you confirm a trusted action.'
  }
});

type Props = {|
  deviceCode: DeviceCodeType,
  wasDeviceLocked: boolean,
  deviceVersion: ?string,
|};

@observer
export default class SendTxHintBlock extends React.Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    const intl = this.context;

    return (
      <div className={styles.component}>
        <div className={styles.title}>
          <img src={yoroiIcon} />
        </div>
        <div className={styles.content}>
          <img src={hardwareWalletsIllustration} />
          <div className={styles.confirm}>
            {intl.formatMessage(messages.confirm)}
          </div>
          <div className={styles.instruction}>
            {intl.formatMessage(messages.instruction1)}
          </div>
          <div className={styles.instruction}>
            {intl.formatMessage(messages.instruction2)}
          </div>
        </div>
      </div>
    );
  }
}

// @flow //
import React from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';

import type { DeviceCodeType } from '../../../../types/enum';
import HintBlock from '../../../widgets/hint/HintBlock';
import { getAddressHintBlock } from '../../../widgets/hint/AddressHintBlock';
import HintGap from '../../../widgets/hint/HintGap';
import {
  pathToString,
} from '../../../../utils/cmn';
import type { ShowAddressRequestWrapper } from '../../../../types/cmn';

import styles from './VerifyAddressHintBlock.scss';
import type {
  DeviceOwnedAddress,
  AddressParamsBase,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { AddressType } from '@cardano-foundation/ledgerjs-hw-app-cardano';

const message = defineMessages({
  sInfo: {
    id: 'hint.verifyAddress.info',
    defaultMessage: '!!!Check your Ledger screen, then press <strong>both</strong> buttons.'
  },
  sPath: {
    id: 'hint.verifyAddress.path',
    defaultMessage: '!!!Make sure the address path shown on your Ledger is the same as the one shown below, then press <strong>both</strong> buttons.'
  },
  sAddress: {
    id: 'hint.verifyAddress.address',
    defaultMessage: '!!!Make sure the address shown on your Ledger is the same as the one shown below, then press <strong>both</strong> buttons.'
  },
  sWarning: {
    id: 'hint.warning',
    defaultMessage: '!!!Accept the warning by pressing <strong>both</strong> buttons.'
  },
  sHash: {
    id: 'hint.hash',
    defaultMessage: '!!!Make sure the hash shown on your Ledger is the same as the one shown below, then press <strong>both</strong> buttons.'
  },
  sPointer: {
    id: 'hint.pointer',
    defaultMessage: '!!!Make sure the pointer shown on your Ledger is the same as the one shown below, then press <strong>both</strong> buttons.'
  },
  xInfo: {
    id: 'hint.verifyAddress.info',
    defaultMessage: '!!!Check your Ledger screen, then press <strong>both</strong> buttons.'
  },
  xPath: {
    id: 'hint.verifyAddress.path',
    defaultMessage: '!!!Make sure the address path shown on your Ledger is the same as the one shown below, then press <strong>both</strong> buttons.'
  },
  xAddress: {
    id: 'hint.nanoX.verifyAddress.address',
    defaultMessage: '!!!Make sure the address shown on your Ledger is the same as the one shown below. Press the <strong>right</strong> button on your Ledger to scroll to the end of the address, then press <strong>both</strong> buttons.'
  },
  xWarning: {
    id: 'hint.warning',
    defaultMessage: '!!!Accept the warning by pressing <strong>both</strong> buttons.'
  },
  xHash: {
    id: 'hint.hash',
    defaultMessage: '!!!Make sure the hash shown on your Ledger is the same as the one shown below, then press <strong>both</strong> buttons.'
  },
  xPointer: {
    id: 'hint.pointer',
    defaultMessage: '!!!Make sure the pointer shown on your Ledger is the same as the one shown below, then press <strong>both</strong> buttons.'
  },
});

type Props = {|
  deviceCode: DeviceCodeType,
  verifyAddressInfo: ShowAddressRequestWrapper,
  wasDeviceLocked: boolean
|};

@observer
export default class VerifyAddressHintBlock extends React.Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };

  render() {
    const {
      deviceCode,
      verifyAddressInfo,
      wasDeviceLocked
    } = this.props;

    const stepStartNumber: number = wasDeviceLocked ? 2 : 0; // 2 = count of common step
    const imgVerify1 = require(`../../../../assets/img/nano-${deviceCode}/hint-verify-1.png`);
    const imgVerify2 = require(`../../../../assets/img/nano-${deviceCode}/hint-verify-2.png`);
    const imgVerify3 = require(`../../../../assets/img/nano-${deviceCode}/hint-verify-3.png`);

    let stepNumber = stepStartNumber;
    const getAndIncrementStep = () => {
      return ++stepNumber;
    };

    let path;
    const address: DeviceOwnedAddress = verifyAddressInfo.address;
    if (address.type === AddressType.BYRON) {
      path = address.params.spendingPath;
    } else if (
      address.type === AddressType.BASE_PAYMENT_KEY_STAKE_KEY ||
        address.type === AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY ||
        address.type === AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT ||
        address.type === AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT
    ) {
      const params: AddressParamsBase = address.params;
      if (params.spendingPath) {
        path = params.spendingPath;
      } else {
        throw new Error('unsupported base address type');
      }
    } else if (
      address.type === AddressType.ENTERPRISE_KEY ||
        address.type === AddressType.ENTERPRISE_SCRIPT
    ) {
      if (address.params.spendingPath) {
        path = address.params.spendingPath;
      } else {
        throw new Error('unsupported enterprise address type');
      }
    } else if (
      address.type === AddressType.POINTER_KEY ||
        address.type === AddressType.POINTER_SCRIPT
    ) {
      if (address.params.spendingPath) {
        path = address.params.spendingPath;
      } else {
        throw new Error('unsupported pointer address type');
      }
    } else if (
      address.type === AddressType.REWARD_KEY ||
        address.type === AddressType.REWARD_SCRIPT
    ) {
      if (address.params.stakingPath) {
        path = address.params.stakingPath;
      } else {
        throw new Error('unsupported reward address type');
      }
    } else {
      throw new Error('unexpected address type');
    }

    const content = (
      <div className={styles.stepsRow}>
        <HintBlock
          number={++stepNumber}
          text={message[`${deviceCode}Info`]}
          imagePath={imgVerify1}
        />
        <HintGap />
        <HintBlock
          number={++stepNumber}
          text={message[`${deviceCode}Path`]}
          imagePath={imgVerify2}
          secondaryText={pathToString(path)}
        />
        <HintGap />
        {getAddressHintBlock({
          deviceCode,
          getAndIncrementStep,
          addressInfo: verifyAddressInfo.address,
        })}
        <HintGap />
        <HintBlock
          number={++stepNumber}
          text={message[`${deviceCode}Address`]}
          imagePath={imgVerify3}
          secondaryText={verifyAddressInfo.expectedAddr}
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

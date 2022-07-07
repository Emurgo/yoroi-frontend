// @flow //
import React from 'react';
import type { Node } from 'react';
import { defineMessages } from 'react-intl';

import type { DeviceCodeType } from '../../../types/enum';
import HintBlock from './HintBlock';
import HintGap from './HintGap';
import {
  pathToString,
} from '../../../utils/cmn';
import {
  AddressType,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import type {
  DeviceOwnedAddress,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

const message = defineMessages({
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
  addressInfo: DeviceOwnedAddress,
  getAndIncrementStep: void => number,
|};

export function getAddressHintBlock(props: Props): Array<Node> {
  const {
    deviceCode,
    addressInfo,
  } = props;

  const stakingKey = require(`../../../assets/img/nano-${deviceCode}/hint-staking-key.png`);
  const byronWarning = require(`../../../assets/img/nano-${deviceCode}/hint-byron-warning.png`);
  const enterpriseWarning = require(`../../../assets/img/nano-${deviceCode}/hint-enterprise-warning.png`);
  const rewardWarning = require(`../../../assets/img/nano-${deviceCode}/hint-reward-warning.png`);
  const keyHash = require(`../../../assets/img/nano-${deviceCode}/hint-keyhash.png`);
  const pointer = require(`../../../assets/img/nano-${deviceCode}/hint-pointer.png`);

  const result: Array<Node> = [];
  if (addressInfo.type === AddressType.BYRON) {
    const nextStep = props.getAndIncrementStep();
    result.push(
      <HintBlock
        key={nextStep}
        number={nextStep}
        text={message[`${deviceCode}Warning`]}
        imagePath={byronWarning}
      />
    );
    result.push(
      <HintGap key={nextStep + 'gap'} />
    );
  }
  if (addressInfo.type === AddressType.ENTERPRISE_KEY) {
    const nextStep = props.getAndIncrementStep();
    result.push(
      <HintBlock
        key={nextStep}
        number={nextStep}
        text={message[`${deviceCode}Warning`]}
        imagePath={enterpriseWarning}
      />
    );
    result.push(
      <HintGap key={nextStep + 'gap'} />
    );
  }
  if (addressInfo.type === AddressType.REWARD_KEY) {
    const nextStep = props.getAndIncrementStep();
    result.push(
      <HintBlock
        key={nextStep}
        number={nextStep}
        text={message[`${deviceCode}Warning`]}
        imagePath={rewardWarning}
      />
    );
    result.push(
      <HintGap key={nextStep + 'gap'} />
    );
  }
  const params = addressInfo.params;
  if (params.stakingPath != null) {
    const stakingPath = params.stakingPath;
    const nextStep = props.getAndIncrementStep();
    result.push(
      <HintBlock
        key={nextStep}
        number={nextStep}
        text={message[`${deviceCode}Path`]}
        imagePath={stakingKey}
        secondaryText={pathToString(stakingPath)}
      />
    );
    result.push(
      <HintGap key={nextStep + 'gap'} />
    );
  }
  if (params.stakingKeyHashHex != null) {
    const stakingKeyHashHex = params.stakingKeyHashHex;
    const nextStep = props.getAndIncrementStep();
    result.push(
      <HintBlock
        key={nextStep}
        number={nextStep}
        text={message[`${deviceCode}Hash`]}
        imagePath={keyHash}
        secondaryText={stakingKeyHashHex}
      />
    );
    result.push(
      <HintGap key={nextStep + 'gap'} />
    );
  }
  if (params.stakingBlockchainPointer != null) {
    const stakingBlockchainPointer = params.stakingBlockchainPointer;
    const nextStep = props.getAndIncrementStep();
    result.push(
      <HintBlock
        key={nextStep}
        number={nextStep}
        text={message[`${deviceCode}Pointer`]}
        imagePath={pointer}
        secondaryText={
          `(${stakingBlockchainPointer.blockIndex}, ${stakingBlockchainPointer.txIndex}, ${stakingBlockchainPointer.certificateIndex})`
        }
      />
    );
    result.push(
      <HintGap key={nextStep + 'gap'} />
    );
  }
  return result;
}

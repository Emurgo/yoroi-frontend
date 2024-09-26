// @flow //
import React from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import semverGte from 'semver/functions/gte';

import type { DeviceCodeType }  from '../../../../types/enum';
import HintBlock from '../../../widgets/hint/HintBlock';
import HintGap from '../../../widgets/hint/HintGap';
import type { SignTransactionRequest, Certificate } from '@cardano-foundation/ledgerjs-hw-app-cardano';
import {
  AddressType,
  CertificateType,
  TxAuxiliaryDataType,
  CredentialParamsType,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import {
  pathToString,
} from '../../../../utils/cmn';
import { bech32 } from 'bech32';
import { getAddressHintBlock } from '../../../widgets/hint/AddressHintBlock';

import styles from './SendTxHintBlock.scss';
import { hexToBytes } from '../../../../../app/coreUtils';

const message = defineMessages({
  sStartNewTx: {
    id: 'hint.sendTx.startNewTx',
    defaultMessage: '!!!Check your Ledger screen, then press <strong>right</strong> button.'
  },
  sConfirmValue: {
    id: 'hint.sendTx.confirmValue',
    defaultMessage: '!!!Confirm the ADA amount by pressing <strong>both</strong> buttons.'
  },
  sConfirmAddress: {
    id: 'hint.sendTx.confirmAddress',
    defaultMessage: "!!!Confirm the receiver's address by pressing <strong>both</strong> buttons."
  },
  sConfirmFee: {
    id: 'hint.sendTx.confirmFee',
    defaultMessage: '!!!Confirm Transaction Fee by pressing <strong>both</strong> buttons.'
  },
  sConfirmTx: {
    id: 'hint.sendTx.confirmTx',
    defaultMessage: '!!!Confirm Transaction Fee by pressing <strong>both</strong> buttons.'
  },
  sTtl: {
    id: 'hint.sendTx.ttl',
    defaultMessage: '!!!Confirm the time-to-live by pressing <strong>both</strong> buttons.'
  },
  sRegistration: {
    id: 'hint.certificate.registration',
    defaultMessage: '!!!Confirm the staking key registration by pressing <strong>both</strong> buttons.'
  },
  sRegistrationComplete: {
    id: 'hint.certificate.registrationComplete',
    defaultMessage: '!!!Confirm the staking key registration by pressing the <strong>right</strong> button.'
  },
  sDeregistration: {
    id: 'hint.certificate.deregistration',
    defaultMessage: '!!!Confirm the deregistration by pressing <strong>both</strong> buttons.'
  },
  sDeregistrationComplete: {
    id: 'hint.certificate.deregistrationComplete',
    defaultMessage: '!!!Confirm the deregistration by pressing the <strong>right</strong> button.'
  },
  sDelegation: {
    id: 'hint.certificate.delegation',
    defaultMessage: '!!!Make sure the pool shown on your Ledger is the same as the one shown below, then press <strong>both</strong> buttons.'
  },
  sDelegationComplete: {
    id: 'hint.certificate.delegationComplete',
    defaultMessage: '!!!Confirm the delegation by pressing the <strong>right</strong> button.'
  },
  sPath: {
    id: 'hint.verifyAddress.path',
    defaultMessage: '!!!Make sure the address path shown on your Ledger is the same as the one shown below, then press <strong>both</strong> buttons.'
  },
  sWithdrawal: {
    id: 'hint.withdrawal',
    defaultMessage: '!!!Confirm the withdrawal, then press <strong>both</strong> buttons.'
  },
  sMetadata: {
    id: 'hint.metadata',
    defaultMessage: '!!!Confirm the metadata <strong>hash</strong>, then press <strong>both</strong> buttons.'
  },
  xStartNewTx: {
    id: 'hint.nanoX.sendTx.startNewTx',
    defaultMessage: '!!!Check your Ledger screen, then press <strong>both</strong> buttons.'
  },
  xConfirmValue: {
    id: 'hint.sendTx.confirmValue',
    defaultMessage: '!!!Confirm the ADA amount by pressing <strong>both</strong> buttons.'
  },
  xConfirmAddress: {
    id: 'hint.nanoX.sendTx.confirmAddress',
    defaultMessage: "!!!Confirm the receiver's address by pressing the <strong>right</strong> button to scroll through the entire address. Then press <strong>both</strong> buttons."
  },
  xConfirmFee: {
    id: 'hint.sendTx.confirmFee',
    defaultMessage: '!!!Confirm Transaction Fee by pressing <strong>both</strong> buttons.'
  },
  xConfirmTx: {
    id: 'hint.nanoX.sendTx.confirmTx',
    defaultMessage: '!!!Confirm the transaction by pressing the <strong>both</strong> buttons.'
  },
  xTtl: {
    id: 'hint.sendTx.ttl',
    defaultMessage: '!!!Confirm the time-to-live by pressing <strong>both</strong> buttons.'
  },
  xRegistration: {
    id: 'hint.certificate.registration',
    defaultMessage: '!!!Confirm the staking key registration by pressing <strong>both</strong> buttons.'
  },
  xRegistrationComplete: {
    id: 'hint.certificate.registrationComplete',
    defaultMessage: '!!!Confirm the staking key registration by pressing the <strong>right</strong> button.'
  },
  xDeregistration: {
    id: 'hint.certificate.deregistration',
    defaultMessage: '!!!Confirm the deregistration by pressing <strong>both</strong> buttons.'
  },
  xDeregistrationComplete: {
    id: 'hint.certificate.deregistrationComplete',
    defaultMessage: '!!!Confirm the deregistration by pressing the <strong>right</strong> button.'
  },
  xDelegation: {
    id: 'hint.certificate.delegation',
    defaultMessage: '!!!Make sure the pool shown on your Ledger is the same as the one shown below, then press <strong>both</strong> buttons.'
  },
  xDelegationComplete: {
    id: 'hint.certificate.delegationComplete',
    defaultMessage: '!!!Confirm the delegation by pressing the <strong>right</strong> button.'
  },
  xPath: {
    id: 'hint.verifyAddress.path',
    defaultMessage: '!!!Make sure the address path shown on your Ledger is the same as the one shown below, then press <strong>both</strong> buttons.'
  },
  xWithdrawal: {
    id: 'hint.withdrawal',
    defaultMessage: '!!!Confirm the withdrawal, then press <strong>both</strong> buttons.'
  },
  xMetadata: {
    id: 'hint.metadata',
    defaultMessage: '!!!Confirm the metadata <strong>hash</strong>, then press <strong>both</strong> buttons.'
  },
  catalystStep1: {
    id: 'hint.catalystStep1',
    defaultMessage: '!!!Confirm the network ID by pressing <strong>both</strong> buttons.',
  },
  catalystStep3: {
    id: 'hint.catalystStep3',
    defaultMessage: '!!!Confirm to register Catalyst voting key by pressing the <strong>right</strong> button.',
  },
  catalystStep4: {
    id: 'hint.catalystStep4',
    defaultMessage: '!!!Confirm the voting public key by pressing <strong>both</strong> buttons.',
  },
  catalystStep5: {
    id: 'hint.catalystStep5',
    defaultMessage: '!!!Confirm the staking key path by pressing <strong>both</strong> buttons.',
  },
  catalystStep6: {
    id: 'hint.catalystStep6',
    defaultMessage: '!!!Confirm the reward address by pressing <strong>both</strong> buttons.',
  },
  catalystStep7: {
    id: 'hint.catalystStep7',
    defaultMessage: '!!!Confirm the nonce by pressing <strong>both</strong> buttons.',
  },
  catalystStep8: {
    id: 'hint.catalystStep8',
    defaultMessage: '!!!Confirm voting key registration by pressing the <strong>right</strong> button.',
  },
  catalystStep9: {
    id: 'hint.catalystStep9',
    defaultMessage: '!!!Confirm the auxilliary data hash by pressing <strong>both</strong> buttons.',
  },
  confirmAssetFingerprint: {
    id: 'hint.sendTx.confirmAssetFingerprint',
    defaultMessage: '!!!Confirm the asset fingerprint by pressing <strong>both</strong> buttons',
  },
  confirmAssetAmount: {
    id: 'hint.sendTx.confirmAssetAmount',
    defaultMessage: '!!!Confirm the token amount by pressing <strong>both</strong> buttons',
  },
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

  renderCertificate: {|
    cert: Certificate,
    getAndIncrementStep: void => number,
    deviceVersion: ?string,
  |} => Array<Node> = (request) => {
    const stakingKey = require(`../../../../assets/img/nano-${this.props.deviceCode}/hint-staking-key.png`);

    if (request.cert.type === CertificateType.STAKE_REGISTRATION) {
      const { params } = request.cert;
      if (params.stakeCredential.type !== CredentialParamsType.KEY_PATH) {
        throw new Error('unsupported stake credential type');
      }
      // $FLowIgnore
      const { keyPath } = params.stakeCredential;
      const imgRegister = require(`../../../../assets/img/nano-${this.props.deviceCode}/hint-registration.png`);
      const imgRegisterConfirm = require(`../../../../assets/img/nano-${this.props.deviceCode}/hint-registration-confirm.png`);
      const firstStep = request.getAndIncrementStep();
      const secondStep = request.getAndIncrementStep();
      const thirdStep = request.getAndIncrementStep();
      return [
        (<HintBlock
          key={firstStep}
          number={firstStep}
          text={message[`${this.props.deviceCode}Registration`]}
          imagePath={imgRegister}
        />),
        (<HintGap key={firstStep + 'gap'} />),
        (<HintBlock
          key={secondStep}
          number={secondStep}
          text={message[`${this.props.deviceCode}Path`]}
          imagePath={stakingKey}
          secondaryText={pathToString(keyPath)}
        />),
        (<HintGap key={secondStep + 'gap'} />),
        (<HintBlock
          key={thirdStep}
          number={thirdStep}
          text={message[`${this.props.deviceCode}RegistrationComplete`]}
          imagePath={imgRegisterConfirm}
        />),
        (<HintGap key={thirdStep + 'gap'} />),
      ];
    }
    if (request.cert.type === CertificateType.STAKE_DELEGATION) {
      const { params } = request.cert;
      if (params.stakeCredential.type !== CredentialParamsType.KEY_PATH) {
        throw new Error('unsupported stake credential type');
      }
      // $FLowIgnore
      const { keyPath } = params.stakeCredential;
      const imgDelegatePool = require(`../../../../assets/img/nano-${this.props.deviceCode}/hint-delegation-pool.png`);
      const imgDelegateConfirm = require(`../../../../assets/img/nano-${this.props.deviceCode}/hint-delegation-confirm.png`);
      const firstStep = request.getAndIncrementStep();
      const secondStep = request.getAndIncrementStep();
      const thirdStep = request.getAndIncrementStep();

      let poolId;
      if (request.deviceVersion === undefined) {
        throw new Error('unexpect null deviceVersion');
      }
      // Starting from version 2.4.1, the Ledger Cardano app show the pool ID
      // in bech32, complying with CIP0005
      if (semverGte(request.deviceVersion, '2.4.1')) {
        poolId = bech32.encode(
          'pool',
          bech32.toWords(hexToBytes(params.poolKeyHashHex))
        );
      } else {
        poolId = params.poolKeyHashHex;
      }

      return [
        (<HintBlock
          key={firstStep}
          number={firstStep}
          text={message[`${this.props.deviceCode}Delegation`]}
          imagePath={imgDelegatePool}
          secondaryText={poolId}
        />),
        (<HintGap key={firstStep + 'gap'} />),
        (<HintBlock
          key={secondStep}
          number={secondStep}
          text={message[`${this.props.deviceCode}Path`]}
          imagePath={stakingKey}
          secondaryText={pathToString(keyPath)}
        />),
        (<HintGap key={secondStep + 'gap'} />),
        (<HintBlock
          key={thirdStep}
          number={thirdStep}
          text={message[`${this.props.deviceCode}DelegationComplete`]}
          imagePath={imgDelegateConfirm}
        />),
        (<HintGap key={thirdStep + 'gap'} />),
      ];
    }
    if (request.cert.type === CertificateType.STAKE_DEREGISTRATION) {
      const { params } = request.cert;
      if (params.stakeCredential.type !== CredentialParamsType.KEY_PATH) {
        throw new Error('unsupported stake credential type');
      }
      // $FLowIgnore
      const { keyPath } = params.stakeCredential;
      const imgDeregister = require(`../../../../assets/img/nano-${this.props.deviceCode}/hint-deregister-key.png`);
      const imgDeregisterConfirm = require(`../../../../assets/img/nano-${this.props.deviceCode}/hint-deregister-confirm.png`);
      const firstStep = request.getAndIncrementStep();
      const secondStep = request.getAndIncrementStep();
      const thirdStep = request.getAndIncrementStep();
      return [
        (<HintBlock
          key={firstStep}
          number={firstStep}
          text={message[`${this.props.deviceCode}Deregistration`]}
          imagePath={imgDeregister}
        />),
        (<HintGap key={firstStep + 'gap'} />),
        (<HintBlock
          key={secondStep}
          number={secondStep}
          text={message[`${this.props.deviceCode}Path`]}
          imagePath={stakingKey}
          secondaryText={pathToString(keyPath)}
        />),
        (<HintGap key={secondStep + 'gap'} />),
        (<HintBlock
          key={thirdStep}
          number={thirdStep}
          text={message[`${this.props.deviceCode}DeregistrationComplete`]}
          imagePath={imgDeregisterConfirm}
        />),
        (<HintGap key={thirdStep + 'gap'} />),
      ];
    }
    if (request.cert.type === CertificateType.STAKE_POOL_REGISTRATION) {
      const { params } = request.cert;
      // TODO
    }
    //  unhandled certificate type
    return [];
  }

  render(): Node {
    const {
      deviceCode,
      wasDeviceLocked,
      deviceVersion,
    } = this.props;
    const stepStartNumber: number = wasDeviceLocked ? 2 : 0; // 2 = count of common step
    let stepNumber = stepStartNumber;
    let content = 'Please confirm on your Ledger.';


    return (
      <div className={styles.component}>
        <div className={styles.stepsGrid}>
          {content}
        </div>
      </div>
    );
  }
}

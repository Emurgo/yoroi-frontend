// // @flow
import type {
  AddressedUtxo,
} from '../types';
import { verifyFromBip44Root }  from '../utils';
import { toDerivationPathString } from '../../../common/lib/crypto/keys/path';
import type {
  CardanoSignTransaction,
  CardanoInput,
  CardanoOutput,
  CardanoWithdrawal,
  CardanoCertificate,
  CardanoAddressParameters,
} from 'trezor-connect/lib/types/networks/cardano';
import {
  CERTIFICATE_TYPE,
  ADDRESS_TYPE,
} from 'trezor-connect/lib/constants/cardano';
import type {
  Address, Value, Addressing,
} from '../../lib/storage/models/PublicDeriver/interfaces';
import { HaskellShelleyTxSignRequest } from './HaskellShelleyTxSignRequest';
import {
  Bip44DerivationLevels,
} from '../../lib/storage/database/walletTypes/bip44/api/utils';
import {
  ChainDerivations,
} from '../../../../config/numbersConfig';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { range } from 'lodash';
import { toHexOrBase58 } from '../../lib/storage/bridge/utils';

// ==================== TREZOR ==================== //
/** Generate a payload for Trezor SignTx */
export async function createTrezorSignTxPayload(
  signRequest: HaskellShelleyTxSignRequest,
  byronNetworkMagic: number,
  networkId: number,
): Promise<$Exact<CardanoSignTransaction>> {
  const txBody = signRequest.self().unsignedTx.build();

  // Inputs
  const trezorInputs = _transformToTrezorInputs(
    signRequest.self().senderUtxos
  );

  // Output
  const trezorOutputs = _generateTrezorOutputs(
    txBody.outputs(),
    signRequest.self().changeAddr
  );

  let request = {
    inputs: trezorInputs,
    outputs: trezorOutputs,
    fee: txBody.fee().to_str(),
    ttl: txBody.ttl().toString(),
    protocolMagic: byronNetworkMagic,
    networkId,
  };

  // withdrawals
  const withdrawals = txBody.withdrawals();

  const getStakingKeyPath = () => {
    // TODO: this entire block is super hacky
    // need to instead pass in a mapping from wallet addresses to addressing
    // or add something similar to the sign request

    // assume the withdrawal is the same path as the UTXOs being spent
    // so just take the first UTXO arbitrarily and change it to the staking key path
    const firstUtxo = signRequest.self().senderUtxos[0];
    if (firstUtxo.addressing.startLevel !== Bip44DerivationLevels.PURPOSE.level) {
      throw new Error(`${nameof(createTrezorSignTxPayload)} unexpected addressing start level`);
    }
    const stakingKeyPath = [...firstUtxo.addressing.path];
    stakingKeyPath[Bip44DerivationLevels.CHAIN.level - 1] = ChainDerivations.CHIMERIC_ACCOUNT;
    stakingKeyPath[Bip44DerivationLevels.ADDRESS.level - 1] = 0;
    return stakingKeyPath;
  };
  request = withdrawals == null
    ? request
    : {
      ...request,
      withdrawals: formatTrezorWithdrawals(
        withdrawals,
        [getStakingKeyPath()],
      )
    };

  // certificates
  const certificates = txBody.certs();
  request = certificates == null
    ? request
    : {
      ...request,
      certificates: formatTrezorCertificates(
        certificates,
        range(0, certificates.len()).map(_i => getStakingKeyPath()),
      )
    };

  const metadata = signRequest.txMetadata();
  request = metadata == null
    ? request
    : {
      ...request,
      metadata: Buffer.from(metadata.to_bytes()).toString('hex')
    };

  return request;
}

function formatTrezorWithdrawals(
  withdrawals: RustModule.WalletV4.Withdrawals,
  path: Array<Array<number>>,
): Array<CardanoWithdrawal> {
  const result = [];

  const withdrawalKeys = withdrawals.keys();
  for (let i = 0; i < withdrawalKeys.len(); i++) {
    const withdrawalAmount = withdrawals.get(withdrawalKeys.get(i));
    if (withdrawalAmount == null) {
      throw new Error(`${nameof(formatTrezorWithdrawals)} should never happen`);
    }
    result.push({
      amount: withdrawalAmount.to_str(),
      path: path[i],
    });
  }
  return result;
}
function formatTrezorCertificates(
  certificates: RustModule.WalletV4.Certificates,
  path: Array<Array<number>>,
): Array<CardanoCertificate> {
  const result = [];
  for (let i = 0; i < certificates.len(); i++) {
    const cert = certificates.get(i);
    if (cert.as_stake_registration() != null) {
      result.push({
        type: CERTIFICATE_TYPE.StakeRegistration,
        path: path[i],
      });
      continue;
    }
    if (cert.as_stake_deregistration() != null) {
      result.push({
        type: CERTIFICATE_TYPE.StakeDeregistration,
        path: path[i],
      });
      continue;
    }
    const delegationCert = cert.as_stake_delegation();
    if (delegationCert != null) {
      result.push({
        type: CERTIFICATE_TYPE.StakeDelegation,
        path: path[i],
        pool: Buffer.from(delegationCert.pool_keyhash().to_bytes()).toString('hex'),
      });
      continue;
    }
    throw new Error(`${nameof(formatTrezorCertificates)} Trezor doesn't support this certificate type`);
  }
  return result;
}

function _transformToTrezorInputs(
  inputs: Array<AddressedUtxo>
): Array<CardanoInput> {
  for (const input of inputs) {
    verifyFromBip44Root(input.addressing);
  }
  return inputs.map(input => ({
    prev_hash: input.tx_hash,
    prev_index: input.tx_index,
    path: toDerivationPathString(input.addressing.path),
  }));
}

function _generateTrezorOutputs(
  txOutputs: RustModule.WalletV4.TransactionOutputs,
  changeAddrs: Array<{| ...Address, ...Value, ...Addressing |}>,
): Array<CardanoOutput> {
  const result = [];
  for (let i = 0; i < txOutputs.len(); i++) {
    const output = txOutputs.get(i);
    const address = output.address();
    const jsAddr = toHexOrBase58(output.address());

    const changeAddr = changeAddrs.find(change => jsAddr === change.address);
    if (changeAddr != null) {
      verifyFromBip44Root(changeAddr.addressing);
      result.push({
        addressParameters: toTrezorAddressParameters(
          address,
          changeAddr.addressing.path
        ),
        amount: output.amount().to_str(),
      });
    } else {
      const byronWasm = RustModule.WalletV4.ByronAddress.from_address(address);
      result.push({
        address: byronWasm == null
          ? address.to_bech32()
          : byronWasm.to_base58(),
        amount: output.amount().to_str(),
      });
    }
  }
  return result;
}

export function toTrezorAddressParameters(
  address: RustModule.WalletV4.Address,
  path: Array<number>,
): CardanoAddressParameters {
  {
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(address);
    if (byronAddr) {
      return {
        addressType: ADDRESS_TYPE.Byron,
        path: toDerivationPathString(path),
      };
    }
  }
  {
    const baseAddr = RustModule.WalletV4.BaseAddress.from_address(address);
    if (baseAddr) {
      const stakeCred = baseAddr.stake_cred();
      const hash = stakeCred.to_keyhash() ?? stakeCred.to_scripthash();
      if (hash == null) {
        throw new Error(`${nameof(toTrezorAddressParameters)} unknown hash type`);
      }
      return {
        addressType: ADDRESS_TYPE.Base,
        path: toDerivationPathString(path),
        // can't always know staking key path since address may not belong to the wallet
        // (mangled address)
        stakingKeyHash: Buffer.from(hash.to_bytes()).toString('hex'),
      };
    }
  }
  {
    const ptrAddr = RustModule.WalletV4.PointerAddress.from_address(address);
    if (ptrAddr) {
      const pointer = ptrAddr.stake_pointer();
      return {
        addressType: ADDRESS_TYPE.Pointer,
        path: toDerivationPathString(path),
        certificatePointer: {
          blockIndex: pointer.slot(),
          txIndex: pointer.tx_index(),
          certificateIndex: pointer.cert_index(),
        },
      };
    }
  }
  {
    const enterpriseAddr = RustModule.WalletV4.EnterpriseAddress.from_address(address);
    if (enterpriseAddr) {
      return {
        addressType: ADDRESS_TYPE.Enterprise,
        path: toDerivationPathString(path),
      };
    }
  }
  {
    const rewardAddr = RustModule.WalletV4.RewardAddress.from_address(address);
    if (rewardAddr) {
      return {
        addressType: ADDRESS_TYPE.Reward,
        path: toDerivationPathString(path),
      };
    }
  }
  throw new Error(`${nameof(toTrezorAddressParameters)} unknown address type`);
}

// @flow

import BigNumber from 'bignumber.js';
import { ISignRequest } from '../../../common/lib/transactions/ISignRequest';
import type { BaseSignRequest } from '../../../ada/transactions/types';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';
import {
  MultiToken,
} from '../../../common/lib/MultiToken';
import { PRIMARY_ASSET_CONSTANTS } from '../../../ada/lib/storage/database/primitives/enums';

type NetworkSettingSnapshot = {|
  // there is no way given just an unsigned transaction body to know which network it belongs to
  +NetworkId: number,
|};

export class JormungandrTxSignRequest implements ISignRequest<RustModule.WalletV3.InputOutput> {

  signRequest: BaseSignRequest<RustModule.WalletV3.InputOutput>;
  networkSettingSnapshot: NetworkSettingSnapshot;

  constructor(
    signRequest: BaseSignRequest<RustModule.WalletV3.InputOutput>,
    networkSettingSnapshot: NetworkSettingSnapshot,
  ) {
    this.signRequest = signRequest;
    this.networkSettingSnapshot = networkSettingSnapshot;
  }

  totalInput(): MultiToken {
    return getTxInputTotal(this.signRequest.unsignedTx, this.networkSettingSnapshot.NetworkId);
  }

  totalOutput(): MultiToken {
    return getTxOutputTotal(this.signRequest.unsignedTx, this.networkSettingSnapshot.NetworkId);
  }

  fee(): MultiToken {
    return getJormungandrTxFee(this.signRequest.unsignedTx, this.networkSettingSnapshot.NetworkId);
  }

  uniqueSenderAddresses(): Array<string> {
    return Array.from(new Set(this.signRequest.senderUtxos.map(utxo => utxo.receiver)));
  }

  receivers(includeChange: boolean): Array<string> {
    const receivers: Array<string> = [];

    const changeAddrs = new Set(this.signRequest.changeAddr.map(change => change.address));
    const outputs = this.signRequest.unsignedTx.outputs();
    for (let i = 0; i < outputs.size(); i++) {
      const output = outputs.get(i);
      const addr = Buffer.from(output.address().as_bytes()).toString('hex');
      if (!includeChange) {
        if (changeAddrs.has(addr)) {
          continue;
        }
      }
      receivers.push(addr);
    }
    return receivers;
  }

  isEqual(tx: ?(mixed| RustModule.WalletV3.InputOutput)): boolean {
    if (tx == null) return false;
    if (!(tx instanceof RustModule.WalletV3.InputOutput)) {
      return false;
    }
    return jormungandrTxEqual(this.signRequest.unsignedTx, tx);
  }

  self(): RustModule.WalletV3.InputOutput {
    return this.signRequest.unsignedTx;
  }
}

export function getTxInputTotal(
  IOs: RustModule.WalletV3.InputOutput,
  networkId: number,
): MultiToken {
  const values = new MultiToken(
    [],
    {
      defaultNetworkId: networkId,
      defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Jormungandr,
    }
  );

  const inputs = IOs.inputs();
  for (let i = 0; i < inputs.size(); i++) {
    const input = inputs.get(i);
    values.add({
      identifier: PRIMARY_ASSET_CONSTANTS.Jormungandr,
      amount: new BigNumber(input.value().to_str()),
      networkId,
    });
  }
  return values;
}

export function getTxOutputTotal(
  IOs: RustModule.WalletV3.InputOutput,
  networkId: number,
): MultiToken {
  const values = new MultiToken(
    [],
    {
      defaultNetworkId: networkId,
      defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Jormungandr,
    }
  );

  const outputs = IOs.outputs();
  for (let i = 0; i < outputs.size(); i++) {
    const output = outputs.get(i);
    values.add({
      identifier: PRIMARY_ASSET_CONSTANTS.Jormungandr,
      amount: new BigNumber(output.value().to_str()),
      networkId,
    });
  }
  return values;
}

export function getJormungandrTxFee(
  IOs: RustModule.WalletV3.InputOutput,
  networkId: number,
): MultiToken {
  const out = getTxOutputTotal(IOs, networkId);
  const ins = getTxInputTotal(IOs, networkId);

  return ins.joinSubtractMutable(out);
}

export function jormungandrTxEqual(
  req1: RustModule.WalletV3.InputOutput,
  req2: RustModule.WalletV3.InputOutput,
): boolean {
  const inputs1 = req1.inputs();
  const inputs2 = req2.inputs();
  if (inputs1.size() !== inputs2.size()) {
    return false;
  }

  const outputs1 = req1.outputs();
  const outputs2 = req2.outputs();
  if (outputs1.size() !== outputs2.size()) {
    return false;
  }

  for (let i = 0; i < inputs1.size(); i++) {
    const input1 = Buffer.from(inputs1.get(i).as_bytes()).toString('hex');
    const input2 = Buffer.from(inputs2.get(i).as_bytes()).toString('hex');
    if (input1 !== input2) {
      return false;
    }
  }
  for (let i = 0; i < outputs1.size(); i++) {
    const output1 = outputs1.get(i);
    const output2 = outputs2.get(i);

    if (output1.value().to_str() !== output2.value().to_str()) {
      return false;
    }
    const out1Addr = Buffer.from(output1.address().as_bytes()).toString('hex');
    const out2Addr = Buffer.from(output2.address().as_bytes()).toString('hex');
    if (out1Addr !== out2Addr) {
      return false;
    }
  }

  return true;
}

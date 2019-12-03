// @flow

import {
  NotEnoughMoneyToSendError,
} from '../../errors';
import type { ConfigType } from '../../../../../config/config-types';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import BigNumber from 'bignumber.js';
import { generateAuthData } from './utils';

declare var CONFIG: ConfigType;

/**
 * Transactions cannot both send money and post a certifiate
 */
type SendType = {|
  amount: BigNumber,
|} | {|
  certificate: RustModule.WalletV3.Certificate,
|};

export function buildUnsignedAccountTx(
  sender: RustModule.WalletV3.PublicKey,
  receiver: string,
  typeSpecific: SendType,
  accountBalance: BigNumber,
): RustModule.WalletV3.InputOutput {
  const wasmReceiver = RustModule.WalletV3.Address.from_bytes(
    Buffer.from(receiver, 'hex')
  );
  if (typeSpecific.amount != null && typeSpecific.amount.gt(accountBalance)) {
    throw new NotEnoughMoneyToSendError();
  }
  const payload = typeSpecific.certificate != null
    ? RustModule.WalletV3.Payload.certificate(typeSpecific.certificate)
    : RustModule.WalletV3.Payload.no_payload();
  const sourceAccount = RustModule.WalletV3.Account.single_from_public_key(sender);

  const feeAlgorithm = RustModule.WalletV3.Fee.linear_fee(
    RustModule.WalletV3.Value.from_str(CONFIG.genesis.linearFee.constant),
    RustModule.WalletV3.Value.from_str(CONFIG.genesis.linearFee.coefficient),
    RustModule.WalletV3.Value.from_str(CONFIG.genesis.linearFee.certificate),
  );

  let fee;
  {
    const fakeTxBuilder = RustModule.WalletV3.InputOutputBuilder.empty();
    fakeTxBuilder.add_input(
      RustModule.WalletV3.Input.from_account(
        sourceAccount,
        // the value we put in here is irrelevant. Just need some value to be able to calculate fee
        RustModule.WalletV3.Value.from_str('1000000'),
      ),
    );

    if (typeSpecific.amount != null) {
      fakeTxBuilder.add_output(
        wasmReceiver,
        // the value we put in here is irrelevant. Just need some value to be able to calculate fee
        RustModule.WalletV3.Value.from_str('1')
      );
    }

    fee = new BigNumber(
      fakeTxBuilder.estimate_fee(feeAlgorithm, payload).to_str()
    );
  }
  const newAmount = typeSpecific.amount != null
    ? typeSpecific.amount.plus(fee)
    : fee;
  if (newAmount.gt(accountBalance)) {
    throw new NotEnoughMoneyToSendError();
  }

  const ioBuilder = RustModule.WalletV3.InputOutputBuilder.empty();
  ioBuilder.add_input(
    RustModule.WalletV3.Input.from_account(
      sourceAccount,
      RustModule.WalletV3.Value.from_str(newAmount.toString()),
    ),
  );
  if (typeSpecific.amount != null) {
    const value = RustModule.WalletV3.Value.from_str(typeSpecific.amount.toString());
    ioBuilder.add_output(
      wasmReceiver,
      value
    );
  }

  const IOs = ioBuilder.seal_with_output_policy(
    payload,
    feeAlgorithm,
    // no change for account transactions
    RustModule.WalletV3.OutputPolicy.forget()
  );

  return IOs;
}

export function signTransaction(
  IOs: RustModule.WalletV3.InputOutput,
  accountCounter: number,
  certificate: ?RustModule.WalletV3.Certificate,
  accountPrivateKey: RustModule.WalletV3.PrivateKey
): RustModule.WalletV3.Fragment {
  const txbuilder = new RustModule.WalletV3.TransactionBuilder();

  const builderSetIOs = certificate != null
    ? txbuilder.payload(certificate)
    : txbuilder.no_payload();

  const builderSetWitness = builderSetIOs.set_ios(
    IOs.inputs(),
    IOs.outputs()
  );

  const witness = RustModule.WalletV3.Witness.for_account(
    RustModule.WalletV3.Hash.from_hex(CONFIG.genesis.genesisHash),
    builderSetWitness.get_auth_data_for_witness(),
    accountPrivateKey,
    RustModule.WalletV3.SpendingCounter.from_u32(accountCounter)
  );
  const witnesses = RustModule.WalletV3.Witnesses.new();
  witnesses.add(witness);

  const builderSignCertificate = builderSetWitness.set_witnesses(
    witnesses
  );
  const payloadAuthData = certificate == null
    ? RustModule.WalletV3.PayloadAuthData.for_no_payload()
    : generateAuthData(
      RustModule.WalletV3.AccountBindingSignature.new_single(
        accountPrivateKey,
        builderSignCertificate.get_auth_data()
      ),
      certificate,
    );
  const signedTx = builderSignCertificate.set_payload_auth(
    payloadAuthData
  );
  const fragment = RustModule.WalletV3.Fragment.from_transaction(signedTx);
  return fragment;
}

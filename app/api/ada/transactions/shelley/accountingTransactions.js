// @flow

import {
  NotEnoughMoneyToSendError,
} from '../../errors';
import type { ConfigType } from '../../../../../config/config-types';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import BigNumber from 'bignumber.js';

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
  if (typeSpecific.amount != null && typeSpecific.amount.gt(accountBalance)) {
    throw new NotEnoughMoneyToSendError();
  }
  const payload = typeSpecific.certificate != null
    ? RustModule.WalletV3.Payload.certificate(typeSpecific.certificate)
    : RustModule.WalletV3.Payload.no_payload();
  const sourceAccount = RustModule.WalletV3.Account.single_from_public_key(sender);

  const feeAlgorithm = RustModule.WalletV3.Fee.linear_fee(
    RustModule.WalletV3.Value.from_str(CONFIG.app.linearFee.constant),
    RustModule.WalletV3.Value.from_str(CONFIG.app.linearFee.coefficient),
    RustModule.WalletV3.Value.from_str(CONFIG.app.linearFee.certificate),
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
        RustModule.WalletV3.Address.from_string(receiver),
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
      RustModule.WalletV3.Address.from_string(receiver),
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

function generateAuthData(
  bindingSignature: RustModule.WalletV3.AccountBindingSignature,
  certificate: ?RustModule.WalletV3.Certificate,
): RustModule.WalletV3.PayloadAuthData {
  if (certificate == null) {
    return RustModule.WalletV3.PayloadAuthData.for_no_payload();
  }

  switch (certificate.get_type()) {
    case RustModule.WalletV3.StakeDelegation: {
      return RustModule.WalletV3.PayloadAuthData.for_stake_delegation(
        RustModule.WalletV3.StakeDelegationAuthData.new(
          bindingSignature
        )
      );
    }
    default: throw new Error('generateAuthData unexptected cert type ' + certificate.get_type());
  }
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
    RustModule.WalletV3.Hash.from_hex(CONFIG.app.genesisHash),
    builderSetWitness.get_auth_data_for_witness(),
    accountPrivateKey,
    RustModule.WalletV3.SpendingCounter.from_u32(accountCounter)
  );
  const witnesses = RustModule.WalletV3.Witnesses.new();
  witnesses.add(witness);

  const builderSignCertificate = builderSetWitness.set_witnesses(
    witnesses
  );
  const payloadAuthData = generateAuthData(
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

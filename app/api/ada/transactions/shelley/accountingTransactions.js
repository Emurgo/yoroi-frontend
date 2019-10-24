// @flow

import {
  NotEnoughMoneyToSendError,
} from '../errors';
import type { ConfigType } from '../../../../config/config-types';
import { RustModule } from '../lib/cardanoCrypto/rustLoader';
import BigNumber from 'bignumber.js';

declare var CONFIG: ConfigType;

export function buildTransaction(
  sender: RustModule.WalletV3.PublicKey,
  receiver: string,
  amount: BigNumber,
  accountBalance: BigNumber,
): RustModule.WalletV3.Transaction {
  if (amount.gt(accountBalance)) {
    throw new NotEnoughMoneyToSendError();
  }
  const sourceAccount = RustModule.WalletV3.Account.from_public_key(sender);

  const feeAlgorithm = RustModule.WalletV3.Fee.linear_fee(
    RustModule.WalletV3.Value.from_str(CONFIG.app.linearFee.constant),
    RustModule.WalletV3.Value.from_str(CONFIG.app.linearFee.coefficient),
    RustModule.WalletV3.Value.from_str(CONFIG.app.linearFee.certificate),
  );

  let fee;
  {
    const fakeTxBuilder = RustModule.WalletV3.TransactionBuilder.new_no_payload();
    fakeTxBuilder.add_input(
      RustModule.WalletV3.Input.from_account(
        sourceAccount,
        // the value we put in here is irrelevant. Just need some value to be able to calculate fee
        RustModule.WalletV3.Value.from_str('1000000'),
      ),
    );
    fakeTxBuilder.add_output(
      RustModule.WalletV3.Address.from_string(receiver),
      // the value we put in here is irrelevant. Just need some value to be able to calculate fee
      RustModule.WalletV3.Value.from_str('1')
    );

    const tx = fakeTxBuilder.seal_with_output_policy(
      feeAlgorithm,
      RustModule.WalletV3.OutputPolicy.forget()
    );
    const calculatedFee = feeAlgorithm.calculate(tx);
    if (calculatedFee == null) {
      throw new NotEnoughMoneyToSendError();
    }
    fee = new BigNumber(calculatedFee.to_str());
  }
  const newAmount = amount.plus(fee);
  if (newAmount.gt(accountBalance)) {
    throw new NotEnoughMoneyToSendError();
  }

  const txBuilder = RustModule.WalletV3.TransactionBuilder.new_no_payload();
  txBuilder.add_input(
    RustModule.WalletV3.Input.from_account(
      sourceAccount,
      RustModule.WalletV3.Value.from_str(newAmount.toString()),
    ),
  );
  txBuilder.add_output(
    RustModule.WalletV3.Address.from_string(receiver),
    RustModule.WalletV3.Value.from_str(amount.toString())
  );

  const tx = txBuilder.seal_with_output_policy(
    feeAlgorithm,
    RustModule.WalletV3.OutputPolicy.forget()
  );
  return tx;
}

export function signTransaction(
  unsignedTx: RustModule.WalletV3.Transaction,
  accountCounter: number,
  accountPrivateKey: RustModule.WalletV3.PrivateKey
): RustModule.WalletV3.AuthenticatedTransaction {
  const txFinalizer = new RustModule.WalletV3.TransactionFinalizer(unsignedTx);
  const witness = RustModule.WalletV3.Witness.for_account(
    RustModule.WalletV3.Hash.from_hex(CONFIG.app.genesisHash),
    txFinalizer.get_tx_sign_data_hash(),
    accountPrivateKey,
    RustModule.WalletV3.SpendingCounter.from_u32(accountCounter)
  );
  txFinalizer.set_witness(0, witness);
  return txFinalizer.finalize();
}

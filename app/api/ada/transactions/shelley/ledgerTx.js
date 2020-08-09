// // @flow
// import type {
//   PrepareAndBroadcastLedgerSignedTxResponse
// } from '../../index';
// import type {
//   LedgerSignTxPayload,
// } from '../../../../domain/HWSignTx';
// import type {
//   InputTypeUTxO,
//   OutputTypeAddress,
//   OutputTypeChange,
//   SignTransactionResponse as LedgerSignTxResponse,
//   Witness
// } from '@cardano-foundation/ledgerjs-hw-app-cardano';

// // ==================== LEDGER ==================== //
// /** Generate a payload for Ledger SignTx */
// export async function createLedgerSignTxPayload(
//   signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBody>,
//   getTxsBodiesForUTXOs: TxBodiesFunc,
// ): Promise<LedgerSignTxPayload> {
//   const txJson = signRequest.unsignedTx.to_json();
//   // Map inputs to UNIQUE tx hashes (there might be multiple inputs from the same tx)
//   const txsHashes = [...new Set(txJson.inputs.map(x => x.id))];
//   const txsBodiesMap = await getTxsBodiesForUTXOs({ txsHashes });

//   const utxoMap = utxosToLookupMap(
//     signRequest.senderUtxos.map(utxo => ({
//       utxo_id: utxo.utxo_id,
//       tx_hash: utxo.tx_hash,
//       tx_index: utxo.tx_index,
//       receiver: utxo.receiver,
//       amount: utxo.amount,
//     }))
//   );

//   // Inputs
//   const ledgerInputs: Array<InputTypeUTxO> =
//     _transformToLedgerInputs(
//       txJson.inputs,
//       new Map(signRequest.senderUtxos.map(utxo => [
//         utxo.receiver,
//         { addressing: utxo.addressing },
//       ])),
//       utxoMap,
//       txsBodiesMap,
//     );

//   // Outputs
//   const ledgerOutputs: Array<OutputTypeAddress | OutputTypeChange> =
//     _transformToLedgerOutputs(
//       txJson.outputs,
//       signRequest.changeAddr,
//     );

//   return {
//     inputs: ledgerInputs,
//     outputs: ledgerOutputs,
//   };
// }

// function _transformToLedgerInputs(
//   inputs: Array<TxoPointerType>,
//   addressMap: Map<string, Addressing>,
//   utxoMap: UtxoLookupMap,
//   txDataHexMap: { [key: string]:string, ... }
// ): Array<InputTypeUTxO> {
//   return inputs.map(input => {
//     const utxo = utxoMap[input.id][input.index];
//     const addressingInfo = addressMap.get(utxo.receiver);
//     if (addressingInfo == null) throw new Error(`${nameof(_transformToLedgerInputs)} should never happen`);
//     verifyFromBip44Root(addressingInfo);
//     return {
//       txDataHex: txDataHexMap[input.id],
//       outputIndex: input.index,
//       path: addressingInfo.addressing.path,
//     };
//   });
// }

// function _transformToLedgerOutputs(
//   txOutputs: Array<TxOutType<number>>,
//   changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
// ): Array<OutputTypeAddress | OutputTypeChange> {
//   return txOutputs.map(txOutput => {
//     const amountStr = txOutput.value.toString();
//     const change = changeAddr.find(addr => addr.address === txOutput.address);
//     if (change != null) {
//       verifyFromBip44Root({ addressing: change.addressing });
//       return {
//         path: change.addressing.path,
//         amountStr,
//       };
//     }

//     return {
//       address58: txOutput.address,
//       amountStr,
//     };
//   });
// }

// export async function prepareAndBroadcastLedgerSignedTx(
//   ledgerSignTxResp: LedgerSignTxResponse,
//   unsignedTx: RustModule.WalletV4.TransactionBody,
//   publicKey: RustModule.WalletV2.PublicKey,
//   keyLevel: number,
//   sendTx: SendFunc,
// ): Promise<PrepareAndBroadcastLedgerSignedTxResponse> {
//   try {
//     Logger.debug('ledgerTx::prepareAndBroadcastLedgerSignedTx: called');

//     const unsignedTxJson = unsignedTx.to_json();
//     Logger.debug(`ledgerTx::prepareAndBroadcastLedgerSignedTx unsignedTx: ${stringifyData(
//       unsignedTxJson
//     )}`);
//     const finalizer = new RustModule.WalletV4.TransactionBodyFinalized(unsignedTx);
//     ledgerSignTxResp.witnesses.map((witness) => prepareWitness(
//       finalizer,
//       witness,
//       publicKey,
//       keyLevel,
//     ));

//     const signedTx = finalizer.finalize();
//     const backendResponse = await sendTx({
//       id: signedTx.id(),
//       encodedTx: Buffer.from(signedTx.to_hex(), 'hex'),
//     });
//     Logger.debug('ledgerTx::prepareAndBroadcastLedgerSignedTx: success');

//     return backendResponse;
//   } catch (sendTxError) {
//     Logger.error('ledgerTx::prepareAndBroadcastLedgerSignedTx error: ' + stringifyError(sendTxError));
//     if (sendTxError instanceof InvalidWitnessError) {
//       throw new InvalidWitnessError();
//     } else {
//       throw new SendTransactionError();
//     }
//   }
// }

// function prepareWitness(
//   finalizer: RustModule.WalletV4.TransactionBodyFinalized,
//   ledgerWitness: Witness,
//   publicKey: RustModule.WalletV2.PublicKey,
//   keyLevel: number,
// ): void {
//   let finalKey = publicKey;
//   for (let i = keyLevel; i < ledgerWitness.path.length; i++) {
//     finalKey = finalKey.derive(
//       RustModule.WalletV2.DerivationScheme.v2(),
//       ledgerWitness.path[i]
//     );
//   }

//   const txSignature = RustModule.WalletV4.TransactionBodySignature.from_hex(
//     ledgerWitness.witnessSignatureHex
//   );

//   const witness = RustModule.WalletV2.Witness.from_external(finalKey, txSignature);
//   finalizer.add_witness(witness);
// }

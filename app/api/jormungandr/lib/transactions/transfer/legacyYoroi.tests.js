// @flow

import '../../../../ada/lib/test-config';
import { schema } from 'lovefield';
import {
  yoroiTransferTxFromAddresses,
} from './yoroiTransfer';
import {
  silenceLogsForTesting,
} from '../../../../../utils/logging';
import {
  Bip44DerivationLevels,
} from '../../../../ada/lib/storage/database/walletTypes/bip44/api/utils';
import type {
  Address, Addressing
} from '../../../../ada/lib/storage/models/PublicDeriver/interfaces';
import {
  ChainDerivations,
} from '../../../../../config/numbersConfig';
import { Bech32Prefix } from '../../../../../config/stringConfig';

import {
  loadLovefieldDB,
} from '../../../../ada/lib/storage/database/index';

import { RustModule } from '../../../../ada/lib/cardanoCrypto/rustLoader';

beforeAll(async () => {
  await RustModule.load();
  await loadLovefieldDB(schema.DataStoreType.MEMORY);
  silenceLogsForTesting();
});

function getJormungandrAddress(
  accountKey: RustModule.WalletV3.Bip32PrivateKey,
  derivationId: number
): {| ...Address, ...Addressing |} {
  const addr = RustModule.WalletV3.Address.single_from_public_key(
    accountKey
      .derive(ChainDerivations.EXTERNAL)
      .derive(0)
      .to_raw_key()
      .to_public(),
    RustModule.WalletV3.AddressDiscrimination.Production
  );
  return {
    address: Buffer.from(addr.as_bytes()).toString('hex'),
    addressing: {
      path: [ChainDerivations.EXTERNAL, derivationId],
      startLevel: Bip44DerivationLevels.CHAIN.level,
    }
  };
}

describe('Jormungandr tx format tests', () => {
  test('Yoroi transfer from single small UTXO', async () => {
    const txId = '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c';
    const inputAmount = '1000000';
    const txIndex = 0;
    const bech32Addr = 'addr1qw8zss87myxjzwrkrk9pffxta5yw6qx0jz9s072wchafmdh56ln5704fx9z';
    const outAddress = Buffer.from(RustModule.WalletV3.Address.from_string(
      bech32Addr
    ).as_bytes()).toString('hex');

    const accountPrivateKey = RustModule.WalletV3.Bip32PrivateKey.from_bytes(
      Buffer.from(
        '408a1cb637d615c49e8696c30dd54883302a20a7b9b8a9d1c307d2ed3cd50758c9402acd000461a8fc0f25728666e6d3b86d031b8eea8d2f69b21e8aa6ba2b153e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
        'hex',
      ),
    );

    const addr1 = getJormungandrAddress(accountPrivateKey, 0);
    const addr2 = getJormungandrAddress(accountPrivateKey, 1);

    const utxo = {
      utxo_id: 'ignore',
      tx_hash: txId,
      tx_index: txIndex,
      receiver: addr1.address,
      amount: inputAmount
    };

    const transferInfo = await yoroiTransferTxFromAddresses({
      addresses: [addr1, addr2],
      getUTXOsForAddresses: (_addresses) => Promise.resolve([utxo]),
      keyLevel: Bip44DerivationLevels.ACCOUNT.level,
      signingKey: accountPrivateKey,
      outputAddr: outAddress,
      useLegacyWitness: false
    });

    expect(transferInfo.fee.toString()).toBe('0.155383');
    expect(transferInfo.recoveredBalance.toString()).toBe('1');
    expect(transferInfo.senders).toEqual([
      RustModule.WalletV3.Address.from_bytes(
        Buffer.from(addr1.address, 'hex')
      ).to_string(Bech32Prefix.ADDRESS)
    ]);
    expect(transferInfo.receiver).toBe(bech32Addr);

    // check tx itself
    const fragment = RustModule.WalletV3.Fragment.from_bytes(transferInfo.encodedTx);
    const signedTx = fragment.get_transaction();

    const inputs = signedTx.inputs();
    expect(inputs.size()).toEqual(1);
    expect(inputs.get(0).value().to_str()).toEqual(inputAmount);
    const pointer = inputs.get(0).get_utxo_pointer();
    expect(Buffer.from(pointer.fragment_id().as_bytes()).toString('hex')).toEqual(txId);
    expect(pointer.output_index()).toEqual(txIndex);

    const outputs = signedTx.outputs();
    expect(outputs.size()).toEqual(1);
    const output = outputs.get(0);
    expect(output.address().to_string('addr')).toEqual(bech32Addr);
    expect(output.value().to_str()).toEqual('844617');

    const witnesses = signedTx.witnesses();
    expect(witnesses.size()).toEqual(1);
    expect(witnesses.get(0).to_bech32()).toEqual(
      'witness1qqruckcp4drq2cj8nul8lhmc9vgkxmz2rdepcxdec9sfh3ekpdgcaum5sum2l42pxcwylwgt993hy0lf5yxjx7szg5cdx7qcrh6t7trg2dapwn34fnun3gl072zkw4zldqekr6xfquvrjmlhpken007laqv48cus2paj0tn3992atkvxrhktdeax8ld8xw9dy2r266zlqpfegpch3ze9k'
    );
  });
});

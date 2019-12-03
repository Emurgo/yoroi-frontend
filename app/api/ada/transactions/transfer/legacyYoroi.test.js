// @flow

import '../../lib/test-config';
import { schema } from 'lovefield';
import {
  generateLegacyYoroiTransferTx,
} from './legacyYoroi';
import {
  silenceLogsForTesting,
} from '../../../../utils/logging';
import {
  Bip44DerivationLevels,
} from '../../lib/storage/database/walletTypes/bip44/api/utils';
import type {
  Address, Addressing
} from '../../lib/storage/models/PublicDeriver/interfaces';
import {
  ChainDerivations,
} from '../../../../config/numbersConfig';

import {
  loadLovefieldDB,
} from '../../lib/storage/database/index';

import type { ConfigType } from '../../../../../config/config-types';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

declare var CONFIG: ConfigType;
const protocolMagic = CONFIG.network.protocolMagic;

beforeAll(async () => {
  await RustModule.load();
  await loadLovefieldDB(schema.DataStoreType.MEMORY);
  silenceLogsForTesting();
});

function getShelleyAddress(
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
    address: addr.to_string('addr'),
    addressing: {
      path: [ChainDerivations.EXTERNAL, derivationId],
      startLevel: Bip44DerivationLevels.CHAIN.level,
    }
  };
}

function getByronAddress(
  accountKey: RustModule.WalletV3.Bip32PrivateKey,
  derivationId: number
): {| ...Address, ...Addressing |} {
  const v3Key = accountKey
    .derive(ChainDerivations.EXTERNAL)
    .derive(0)
    .to_public();
  const v2Key = RustModule.WalletV2.PublicKey.from_hex(
    Buffer.from(v3Key.as_bytes()).toString('hex')
  );
  const addr = v2Key.bootstrap_era_address(
    RustModule.WalletV2.BlockchainSettings.from_json({
      protocol_magic: protocolMagic
    })
  );
  return {
    address: addr.to_base58(),
    addressing: {
      path: [ChainDerivations.EXTERNAL, derivationId],
      startLevel: Bip44DerivationLevels.CHAIN.level,
    }
  };
}

describe('Byron era tx format tests', () => {
  test('Yoroi transfer from single small UTXO', async () => {
    const txId = '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c';
    const inputAmount = '1000000';
    const txIndex = 0;
    const outAddress = 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4';

    const accountPrivateKey = RustModule.WalletV3.Bip32PrivateKey.from_bytes(
      Buffer.from(
        '408a1cb637d615c49e8696c30dd54883302a20a7b9b8a9d1c307d2ed3cd50758c9402acd000461a8fc0f25728666e6d3b86d031b8eea8d2f69b21e8aa6ba2b153e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
        'hex',
      ),
    );

    const addr1 = getByronAddress(accountPrivateKey, 0);
    const addr2 = getByronAddress(accountPrivateKey, 1);

    const utxo = {
      utxo_id: 'ignore',
      tx_hash: txId,
      tx_index: txIndex,
      receiver: addr1.address,
      amount: inputAmount
    };

    const transferInfo = await generateLegacyYoroiTransferTx({
      addresses: [addr1, addr2],
      getUTXOsForAddresses: (_addresses) => Promise.resolve([utxo]),
      keyLevel: Bip44DerivationLevels.ACCOUNT.level,
      signingKey: accountPrivateKey,
      outputAddr: outAddress,
      legacy: true
    });

    expect(transferInfo.fee.toString()).toBe('0.165841');
    expect(transferInfo.recoveredBalance.toString()).toBe('1');
    expect(transferInfo.senders).toEqual([addr1.address]);
    expect(transferInfo.receiver).toBe(outAddress);

    // check tx itself
    const signedTx = RustModule.WalletV2.SignedTransaction.from_bytes(transferInfo.encodedTx);
    const txJson = signedTx.to_json();
    expect(txJson.tx.inputs).toHaveLength(1);
    expect(txJson.tx.inputs[0].id).toBe(txId);
    expect(txJson.tx.inputs[0].index).toBe(txIndex);

    expect(txJson.tx.outputs).toHaveLength(1);
    expect(txJson.tx.outputs[0].address).toBe(outAddress);
    expect(txJson.tx.outputs[0].value).toBe(834159);

    expect(txJson.witness).toHaveLength(1);
    expect(txJson.witness[0].PkWitness).toEqual([
      '07cc5b01ab460562479f3e7fdf782b11636c4a1b721c19b9c1609bc7360b518ef3748736afd541361c4fb90b2963723fe9a10d237a024530d378181df4bf2c68',
      'c7beab6de0a38171bb4530c5f287239fba79fd8f2d89ba05a233c172bac4995d6933634521aba2ae43a175929ef0738ca531b22cf564071bd7149d8e80845500',
    ]);
  });
});

describe('Shelley era tx format tests', () => {
  test('Yoroi transfer from single small UTXO', async () => {
    const txId = '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c';
    const inputAmount = '1000000';
    const txIndex = 0;
    const outAddress = RustModule.WalletV3.Address.from_bytes(
      Buffer.from('038e2840fed90d2138761d8a14a4cbed08ed00cf908b07f94ec5fa9db6f4d7e74f', 'hex')
    ).to_string('addr');

    const accountPrivateKey = RustModule.WalletV3.Bip32PrivateKey.from_bytes(
      Buffer.from(
        '408a1cb637d615c49e8696c30dd54883302a20a7b9b8a9d1c307d2ed3cd50758c9402acd000461a8fc0f25728666e6d3b86d031b8eea8d2f69b21e8aa6ba2b153e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
        'hex',
      ),
    );

    const addr1 = getShelleyAddress(accountPrivateKey, 0);
    const addr2 = getShelleyAddress(accountPrivateKey, 1);

    const utxo = {
      utxo_id: 'ignore',
      tx_hash: txId,
      tx_index: txIndex,
      receiver: addr1.address,
      amount: inputAmount
    };

    const transferInfo = await generateLegacyYoroiTransferTx({
      addresses: [addr1, addr2],
      getUTXOsForAddresses: (_addresses) => Promise.resolve([utxo]),
      keyLevel: Bip44DerivationLevels.ACCOUNT.level,
      signingKey: accountPrivateKey,
      outputAddr: outAddress,
      legacy: false
    });

    expect(transferInfo.fee.toString()).toBe('0.155383');
    expect(transferInfo.recoveredBalance.toString()).toBe('1');
    expect(transferInfo.senders).toEqual([addr1.address]);
    expect(transferInfo.receiver).toBe(outAddress);

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
    expect(output.address().to_string('addr')).toEqual(outAddress);
    expect(output.value().to_str()).toEqual('844617');

    const witnesses = signedTx.witnesses();
    expect(witnesses.size()).toEqual(1);
    expect(witnesses.get(0).to_bech32()).toEqual(
      'witness1qqruckcp4drq2cj8nul8lhmc9vgkxmz2rdepcxdec9sfh3ekpdgcaum5sum2l42pxcwylwgt993hy0lf5yxjx7szg5cdx7qcrh6t7trg2dapwn34fnun3gl072zkw4zldqekr6xfquvrjmlhpken007laqv48cus2paj0tn3992atkvxrhktdeax8ld8xw9dy2r266zlqpfegpch3ze9k'
    );
  });
});

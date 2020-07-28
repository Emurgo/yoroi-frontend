// @flow

import '../../lib/test-config';
import { schema } from 'lovefield';
import {
  yoroiTransferTxFromAddresses,
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
import { networks } from '../../lib/storage/database/prepackaged/networks';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

beforeAll(async () => {
  await RustModule.load();
  await loadLovefieldDB(schema.DataStoreType.MEMORY);
  silenceLogsForTesting();
});

function getByronAddress(
  accountKey: RustModule.WalletV4.Bip32PrivateKey,
  derivationId: number
): {| ...Address, ...Addressing |} {
  const v3Key = accountKey
    .derive(ChainDerivations.EXTERNAL)
    .derive(0)
    .to_public();
  const v2Key = RustModule.WalletV2.PublicKey.from_hex(
    Buffer.from(v3Key.as_bytes()).toString('hex')
  );

  const baseConfig = networks.ByronMainnet.BaseConfig[0];
  if (baseConfig.ByronNetworkId == null) {
    throw new Error(`missing Byron network id`);
  }
  const { ByronNetworkId } = baseConfig;
  const addr = v2Key.bootstrap_era_address(
    RustModule.WalletV2.BlockchainSettings.from_json({
      protocol_magic: ByronNetworkId
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

    const accountPrivateKey = RustModule.WalletV4.Bip32PrivateKey.from_bytes(
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

    const baseConfig = networks.ByronMainnet.BaseConfig[0];
    if (baseConfig.ByronNetworkId == null) {
      throw new Error(`missing Byron network id`);
    }

    const transferInfo = await yoroiTransferTxFromAddresses({
      addresses: [addr1, addr2],
      getUTXOsForAddresses: (_addresses) => Promise.resolve([utxo]),
      keyLevel: Bip44DerivationLevels.ACCOUNT.level,
      signingKey: accountPrivateKey,
      outputAddr: outAddress,
      byronNetworkMagic: baseConfig.ByronNetworkId,
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

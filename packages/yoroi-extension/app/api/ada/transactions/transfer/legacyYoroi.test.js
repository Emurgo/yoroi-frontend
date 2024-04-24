// @flow

import '../../lib/test-config.forTests';
import BigNumber from 'bignumber.js';
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
import { networks, getCardanoHaskellBaseConfig } from '../../lib/storage/database/prepackaged/networks';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

beforeAll(async () => {
  await RustModule.load();
  await loadLovefieldDB(schema.DataStoreType.MEMORY);
  silenceLogsForTesting();
});

const network = networks.CardanoMainnet;

function getProtocolParams(): {|
  keyDeposit: RustModule.WalletV4.BigNum,
  linearFee: RustModule.WalletV4.LinearFee,
  coinsPerUtxoWord: RustModule.WalletV4.BigNum,
  poolDeposit: RustModule.WalletV4.BigNum,
  networkId: number,
  |} {
  const baseConfig = getCardanoHaskellBaseConfig(network)
    .reduce((acc, next) => Object.assign(acc, next), {});
  return {
    keyDeposit: RustModule.WalletV4.BigNum.from_str(baseConfig.KeyDeposit),
    linearFee: RustModule.WalletV4.LinearFee.new(
      RustModule.WalletV4.BigNum.from_str(baseConfig.LinearFee.coefficient),
      RustModule.WalletV4.BigNum.from_str(baseConfig.LinearFee.constant),
    ),
    coinsPerUtxoWord: RustModule.WalletV4.BigNum.from_str(baseConfig.CoinsPerUtxoWord),
    poolDeposit: RustModule.WalletV4.BigNum.from_str(baseConfig.PoolDeposit),
    networkId: network.NetworkId,
  };
}

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

  const baseConfig = network.BaseConfig[0];
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

describe('Haskell Shelley era tx format tests', () => {
  test('Yoroi transfer from single small UTXO', async () => {
    const txId = '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c';
    const inputAmount = new BigNumber('10000000');
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
      amount: inputAmount.toString(),
      assets: [],
    };

    const baseConfig = networks.CardanoMainnet.BaseConfig[0];
    if (baseConfig.ByronNetworkId == null) {
      throw new Error(`missing Byron network id`);
    }

    const transferInfo = await yoroiTransferTxFromAddresses({
      addresses: [addr1, addr2],
      network,
      getUTXOsForAddresses: (_addresses) => Promise.resolve([utxo]),
      keyLevel: Bip44DerivationLevels.ACCOUNT.level,
      signingKey: accountPrivateKey,
      outputAddr: {
        address: outAddress
      },
      absSlotNumber: new BigNumber(1),
      protocolParams: getProtocolParams(),
    });

    const expectedFee = new BigNumber('166337');
    expect(transferInfo.fee.getDefault().toString()).toBe(expectedFee.toString());
    expect(transferInfo.recoveredBalance.getDefault().toString()).toBe(inputAmount.toString());
    expect(transferInfo.senders).toEqual([addr1.address]);
    expect(transferInfo.receivers[0]).toBe(outAddress);

    // check tx itself
    if (!transferInfo.encodedTx) throw new Error(`Tx not signed`);
    const signedTx = RustModule.WalletV4.Transaction.from_bytes(transferInfo.encodedTx);
    const body = signedTx.body();
    expect(body.inputs().len()).toBe(1);
    expect(Buffer.from(body.inputs().get(0).transaction_id().to_bytes()).toString('hex')).toBe(txId);
    expect(body.inputs().get(0).index()).toBe(txIndex);

    expect(body.outputs().len()).toBe(1);
    expect(
      // eslint-disable-next-line camelcase
      RustModule.WalletV4.ByronAddress.from_address(body.outputs().get(0).address())?.to_base58()
    ).toBe(outAddress);
    expect(
      body.outputs().get(0).amount().coin().to_str()
    ).toBe(inputAmount.minus(expectedFee).toString());

    const witnesses = signedTx.witness_set().bootstraps();
    if (witnesses == null) throw new Error('no bootstrap witnesses found');
    expect(witnesses.len()).toBe(1);
    expect(Buffer.from(witnesses.get(0).to_bytes()).toString('hex'))
      .toBe('84582007cc5b01ab460562479f3e7fdf782b11636c4a1b721c19b9c1609bc7360b518e584019d98b819060294910b7669d0e7e4b6c8843f9524626ff53b028ac9d38f415eb389141bad0589f858133423a07b13245af641f152bf4b06287171315676ae2045820f3748736afd541361c4fb90b2963723fe9a10d237a024530d378181df4bf2c6841a0');
  });
});

// @flow

import '../test-config';
import { RustModule } from '../cardanoCrypto/rustLoader';

import {
  batchGetTransactionsHistoryForAddresses,
} from './batchedFetcher';
import {
  genGetTransactionsHistoryForAddresses,
} from '../storage/bridge/tests/mockNetwork';
import {
  generateWalletRootKey,
} from '../cardanoCrypto/cryptoWallet';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
} from '../../../../config/numbersConfig';
import type {
  ConfigType,
} from '../../../../../config/config-types';
import config from '../../../../config';
import {
  networks,
} from '../storage/database/prepackaged/networks';

declare var CONFIG: ConfigType;
const protocolMagic = CONFIG.network.protocolMagic;

beforeAll(async () => {
  await RustModule.load();
});

test('Batched history', async (done) => {
  const chainKey = (() => {
    const rootPk = generateWalletRootKey('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon share');
    const v3Chain = rootPk
      .derive(WalletTypePurpose.BIP44)
      .derive(CoinTypes.CARDANO)
      .derive(HARD_DERIVATION_START + 0)
      .derive(ChainDerivations.EXTERNAL);
    return RustModule.WalletV2.Bip44ChainPublic.new(
      RustModule.WalletV2.PublicKey.from_hex(
        Buffer.from(v3Chain.to_public().as_bytes()).toString('hex')
      ),
      RustModule.WalletV2.DerivationScheme.v2()
    );
  })();

  // We want to make sure both batching on addresses and transactions is executed
  const numIterations = (Math.max(
    CONFIG.app.addressRequestSize,
    config.wallets.TRANSACTION_REQUEST_SIZE,
  ) * 2) + 1;

  const addresses = [];
  for (let i = 0; i < numIterations; i++) {
    const pubKey = chainKey.address_key(
      RustModule.WalletV2.AddressKeyIndex.new(i)
    );
    const addr = pubKey.bootstrap_era_address(RustModule.WalletV2.BlockchainSettings.from_json({
      protocol_magic: protocolMagic
    }));
    const hex = addr.to_base58();
    addresses.push(hex);
  }

  const transactions = [];
  for (let i = 0; i < numIterations; i++) {
    const genesisBlockHask = '0';
    transactions.push({
      hash: (i + 1).toString(),
      inputs: [
        {
          address: addresses[0],
          txHash: genesisBlockHask,
          id: genesisBlockHask + i.toString(),
          index: i,
          amount: '1000000'
        }
      ],
      outputs: [
        {
          address: addresses[i],
          amount: '1'
        },
      ],
      height: i,
      epoch: 0,
      slot: i,
      tx_ordinal: 0,
      block_hash: i.toString(),
      time: new Date(i).toString(),
      last_update: new Date(i).toString(),
      tx_state: 'Successful'
    });
  }

  const getTransactionsHistoryForAddresses = await batchGetTransactionsHistoryForAddresses(
    genGetTransactionsHistoryForAddresses(transactions, networks.ByronMainnet)
  );
  const result = await getTransactionsHistoryForAddresses({
    addresses,
    untilBlock: transactions[transactions.length - 1].block_hash || ''
  });

  expect(result.length).toEqual(numIterations);
  done();
});

// @flow

import '../../test-config';
import { loadLovefieldDB } from './index';
import {
  GetAllBip44Wallets,
} from './uncategorized/api/get';
import {
  GetDerivationsByPath,
  GetDerivation,
} from './genericBip44/api/get';
import {
  DerivationLevels,
} from './genericBip44/api/utils';
import {
  AddDerivationWithParent,
} from './genericBip44/api/add';
import {
  Bip44DerivationSchema,
  Bip44AccountSchema,
  Bip44ChainSchema,
  Bip44AddressSchema,
  Bip44DerivationMappingSchema,
} from './genericBip44/tables';
import type {
  Bip44ChainInsert, Bip44ChainRow,
  Bip44AddressInsert, Bip44AddressRow,
} from './genericBip44/tables';
import { HARD_DERIVATION_START } from '../../../../../config/numbersConfig';

import { RustModule } from '../../cardanoCrypto/rustLoader';

import { Bip44Wallet } from '../models/Bip44Wallet';
import { LovefieldBridge } from '../bridge/lovefieldBridge';
import { LovefieldDerive } from '../bridge/lovefieldDerive';
import { WalletBuilder } from '../bridge/walletBuilder';
import { KeySchema } from './uncategorized/tables';

import { getAllSchemaTables } from './utils';

const mnemonic = 'prevent company field green slot measure chief hero apple task eagle sunset endorse dress seed';
const _password = 'greatest_password_ever';
const coinTypeIndex = 0x80000000 + 1815;
const purposeIndex = 0x80000000 + 44;

beforeAll(async () => {
  await RustModule.load();
});

test('Can add and fetch address in wallet', async () => {
  const setting = RustModule.Wallet.BlockchainSettings.from_json({
    protocol_magic: 764824073 // mainnet
  });
  const entropy = RustModule.Wallet.Entropy.from_english_mnemonics(mnemonic);
  const rootPk = RustModule.Wallet.Bip44RootPrivateKey.recover(entropy, '');

  const db = await loadLovefieldDB(true);

  const firstAccountIndex = 0 + HARD_DERIVATION_START;
  let state;
  {
    state = await WalletBuilder
      .start(db)
      .addConceptualWallet(
        _finalState => ({
          CoinType: coinTypeIndex,
          Name: 'My Test Wallet',
        })
      )
      .addBip44Wrapper(
        finalState => ({
          ConceptualWalletId: finalState.conceptualWalletRow.ConceptualWalletId,
          IsBundled: false,
          SignerLevel: DerivationLevels.ACCOUNT.level,
          PublicDeriverLevel: DerivationLevels.ACCOUNT.level,
          Version: 2,
        })
      )
      .addPrivateDeriver(
        finalState => ({
          addLevelRequest: {
            privateKeyInfo: {
              Hash: rootPk.key().to_hex(),
              IsEncrypted: false,
              PasswordLastUpdate: null,
            },
            publicKeyInfo: null,
            derivationInfo: keys => ({
              PublicKeyId: keys.public,
              PrivateKeyId: keys.private,
              Index: 0,
            }),
            levelInfo: id => ({
              Bip44DerivationId: id,
            })
          },
          level: DerivationLevels.ROOT.level,
          addPrivateDeriverRequest: derivationId => ({
            Bip44WrapperId: finalState.bip44WrapperRow.Bip44WrapperId,
            Bip44DerivationId: derivationId,
            Level: DerivationLevels.ROOT.level,
          }),
        })
      )
      .derivePublicDeriver(
        _finalState => ({
          decryptPrivateDeriverPassword: null, // TODO
          publicDeriverPublicKey: {
            password: null,
            lastUpdate: new Date(),
          },
          publicDeriverPrivateKey: {
            password: null, // TODO
            lastUpdate: new Date(),
          },
          publicDeriverInsert: id => ({
            Bip44DerivationId: id,
            Name: 'First account',
            LastBlockSync: 0,
          }),
          pathToPublic: [
            {
              index: purposeIndex,
              insert: {},
            },
            {
              index: coinTypeIndex,
              insert: {},
            },
            {
              index: firstAccountIndex,
              insert: {},
            },
          ],
        })
      )
      .commit();
  }

  const Bip44DerivationMappingTable = db.getSchema().table(Bip44DerivationMappingSchema.name);
  const KeyTable = db.getSchema().table(KeySchema.name);
  const Bip44DerivationTable = db.getSchema().table(Bip44DerivationSchema.name);

  const accountIndex = 1 + HARD_DERIVATION_START;
  const bip44AccountPk = rootPk.bip44_account(
    RustModule.Wallet.AccountIndex.new(accountIndex)
  );
  const bridge = new LovefieldBridge(db);
  const bipWallet = new Bip44Wallet(
    state.conceptualWalletRow.ConceptualWalletId,
    state.bip44WrapperRow.Bip44WrapperId,
  );
  await bridge.addBip44WalletFunctionality(bipWallet);
  expect(bipWallet instanceof LovefieldDerive).toEqual(true);
  if (!(bipWallet instanceof LovefieldDerive)) {
    throw new Error('should never happen due to assertion above');
  }
  const pubDeriver = await bipWallet.derive(
    {
      publicDeriverInsert: id => ({
        Bip44DerivationId: id,
        Name: 'Checking account',
        LastBlockSync: 0,
      }),
      pathToPublic: [
        {
          index: purposeIndex,
          insert: {},
        },
        {
          index: coinTypeIndex,
          insert: {},
        },
        {
          index: accountIndex,
          insert: {},
        },
      ],
      decryptPrivateDeriverPassword: null,
      publicDeriverPublicKey: {
        password: null, // TODO
        lastUpdate: null,
      },
      publicDeriverPrivateKey: {
        password: null, // TODO
        lastUpdate: null,
      },
    },
    {},
  );

  const tx2 = db.createTransaction();
  const Bip44AccountTable = db.getSchema().table(Bip44AccountSchema.name);
  const Bip44ChainTable = db.getSchema().table(Bip44ChainSchema.name);
  const Bip44AddressTable = db.getSchema().table(Bip44AddressSchema.name);
  await tx2.begin([
    KeyTable,
    Bip44DerivationMappingTable,
    Bip44DerivationTable,
    Bip44AccountTable,
    Bip44ChainTable,
    Bip44AddressTable,
  ]);

  const externalChain = await AddDerivationWithParent.add<Bip44ChainInsert, Bip44ChainRow>(
    db, tx2,
    {
      parentDerivationId: pubDeriver.publcDeriverResult.Bip44DerivationId,
      privateKeyInfo: null,
      publicKeyInfo: null,
      derivationInfo: keys => ({
        PublicKeyId: keys.public,
        PrivateKeyId: keys.private,
        Index: 0,
      }),
      levelInfo: id => ({
        Bip44DerivationId: id,
        LastReceiveIndex: 0,
      }),
    },
    DerivationLevels.CHAIN.level,
  );
  const _internalChain = await AddDerivationWithParent.add<Bip44ChainInsert, Bip44ChainRow>(
    db, tx2,
    {
      parentDerivationId: pubDeriver.publcDeriverResult.Bip44DerivationId,
      privateKeyInfo: null,
      publicKeyInfo: null,
      derivationInfo: keys => ({
        PublicKeyId: keys.public,
        PrivateKeyId: keys.private,
        Index: 1,
      }),
      levelInfo: id => ({
        Bip44DerivationId: id,
        LastReceiveIndex: null,
      }),
    },
    DerivationLevels.CHAIN.level,
  );

  const addressPk = bip44AccountPk
    .bip44_chain(false)
    .address_key(RustModule.Wallet.AddressKeyIndex.new(0));
  const addressHash = addressPk.public().bootstrap_era_address(setting).to_base58();
  const _address = await AddDerivationWithParent.add<Bip44AddressInsert, Bip44AddressRow>(
    db, tx2,
    {
      parentDerivationId: externalChain.Bip44Derivation.Bip44DerivationId,
      privateKeyInfo: null,
      publicKeyInfo: null,
      derivationInfo: keys => ({
        PublicKeyId: keys.public,
        PrivateKeyId: keys.private,
        Index: 0,
      }),
      levelInfo: id => ({
        Bip44DerivationId: id,
        Hash: addressHash,
      }),
    },
    DerivationLevels.ADDRESS.level,
  );

  await tx2.commit();

  const tx3 = db.createTransaction();
  await tx3.begin([
    Bip44DerivationMappingTable, Bip44DerivationTable, Bip44AddressTable,
  ]);
  const addressesForAccount = await GetDerivationsByPath.get(
    db,
    tx3,
    pubDeriver.publcDeriverResult.Bip44DerivationId,
    [purposeIndex, coinTypeIndex, accountIndex],
    [null, null]
  );
  const dbAddresses = await GetDerivation.get<Bip44AddressRow>(
    db,
    tx3,
    Array.from(addressesForAccount.keys()),
    DerivationLevels.ADDRESS.level,
  );
  const result = dbAddresses.map(row => (
    { hash: row.Hash, addressing: addressesForAccount.get(row.Bip44DerivationId) }
  ));

  await tx3.commit();

  expect(result.length).toEqual(1);
  expect(result[0].hash).toEqual(addressHash);
  expect(result[0].addressing).toEqual([purposeIndex, coinTypeIndex, accountIndex, 0, 0]);

  const tx4 = db.createTransaction();
  await tx4.begin(getAllSchemaTables(db, GetAllBip44Wallets));

  const bip44Wallets = await GetAllBip44Wallets.get(
    db,
    tx4,
  );

  expect(JSON.stringify(bip44Wallets)).toEqual(JSON.stringify([
    {
      ConceptualWallet: {
        CoinType: 2147485463,
        Name: 'My Test Wallet',
        ConceptualWalletId: 1
      },
      Bip44Wrapper: {
        ConceptualWalletId: 1,
        IsBundled: false,
        SignerLevel: 3,
        PublicDeriverLevel: 3,
        Version: 2,
        Bip44WrapperId: 1
      }
    }
  ]));
});

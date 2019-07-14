// @flow

import '../../test-config';
import { loadLovefieldDB } from './index';
import {
  addKey,
  addConceptualWallet,
  getAllBip44Wallets,
} from './uncategorized/api';
import {
  DerivationLevels,
  addBip44Wrapper,
  addBip44Root, addBip44Purpose, addBip44CoinType, addBip44Account,
  addPrivateDeriver,
  addPublicDeriver,
  deriveFromRoot, deriveFromPurpose,
  deriveFromAccount, deriveFromChain,
  getDerivationsByPath,
  getBip44Address,
  TableMap,
} from './genericBip44/api';
import {
  Bip44WrapperSchema, PrivateDeriverSchema,
  Bip44RootSchema, Bip44PurposeSchema, Bip44CoinTypeSchema, Bip44DerivationSchema, Bip44AccountSchema, Bip44ChainSchema, Bip44AddressSchema, Bip44DerivationMappingSchema,
} from './genericBip44/tables';
import { HARD_DERIVATION_START } from '../../../../../config/numbersConfig';

import { RustModule } from '../../cardanoCrypto/rustLoader';

import { Bip44Wallet } from '../models/Bip44Wallet';
import { LovefieldBridge } from '../bridge/LovefieldBridge';
import { LovefieldDerive } from '../bridge/LovefieldDerive';
import { ConceptualWalletSchema, KeySchema } from './uncategorized/tables';

const mnemonic = 'prevent company field green slot measure chief hero apple task eagle sunset endorse dress seed';
const password = 'greatest_password_ever';
const coinTypeIndex = 0x80000000 + 1815;
const purposeIndex = 0x80000000 + 44;

beforeAll(async () => {
  await RustModule.load();
});

test('Can add and fetch address in wallet', async () => {
  const setting = RustModule.Wallet.BlockchainSettings.from_json({
    protocol_magic: 764824073 // mainnet
  });

  const db = await loadLovefieldDB(true);

  const ConceptualWalletTable = db.getSchema().table(ConceptualWalletSchema.name);
  const Bip44DerivationMappingTable = db.getSchema().table(Bip44DerivationMappingSchema.name);
  const KeyTable = db.getSchema().table(KeySchema.name);
  const Bip44WrapperTable = db.getSchema().table(Bip44WrapperSchema.name);
  const PrivateDeriverTable = db.getSchema().table(PrivateDeriverSchema.name);
  const Bip44DerivationTable = db.getSchema().table(Bip44DerivationSchema.name);
  const Bip44RootTable = db.getSchema().table(Bip44RootSchema.name);
  const Bip44PurposeTable = db.getSchema().table(Bip44PurposeSchema.name);
  const Bip44CoinTypeTable = db.getSchema().table(Bip44CoinTypeSchema.name);

  const tx1 = db.createTransaction();
  await tx1.begin([
    ConceptualWalletTable,
    KeyTable,
    Bip44DerivationMappingTable,
    Bip44WrapperTable,
    PrivateDeriverTable,
    Bip44DerivationTable,
    Bip44RootTable,
    Bip44PurposeTable,
    Bip44CoinTypeTable,
  ]);
  const conceptualWallet = await addConceptualWallet({
    db,
    tx: tx1,
    row: {
      CoinType: coinTypeIndex,
      Name: 'My Test Wallet',
    }
  });


  const entropy = RustModule.Wallet.Entropy.from_english_mnemonics(mnemonic);
  const rootPk = RustModule.Wallet.Bip44RootPrivateKey.recover(entropy, '');
  const privateRootKey = await addKey({
    db,
    tx: tx1,
    row: {
      Hash: rootPk.key().to_hex(),
      IsEncrypted: false,
      PasswordLastUpdate: null,
    }
  });
  const addRootResult = await addBip44Root({
    db,
    tx: tx1,
    keyInfo: {
      PublicKeyId: null,
      PrivateKeyId: privateRootKey.KeyId,
      Index: 0,
    },
    derivationInfo: id => ({
      Bip44DerivationId: id,
    })
  });

  const wrapper = await addBip44Wrapper({
    db,
    tx: tx1,
    row: {
      ConceptualWalletId: conceptualWallet.ConceptualWalletId,
      IsBundled: false,
      SignerLevel: DerivationLevels.ACCOUNT.level,
      PublicDeriverLevel: DerivationLevels.ACCOUNT.level,
      Version: 2,
    }
  });

  const privateDeriver = await addPrivateDeriver({
    db,
    tx: tx1,
    row: {
      Bip44WrapperId: wrapper.Bip44WrapperId,
      Bip44DerivationId: addRootResult.derivationTableResult.Bip44DerivationId,
      Level: DerivationLevels.ROOT.level,
    }
  });

  // Add purpose
  const purposeKey = rootPk.key().derive(
    RustModule.Wallet.DerivationScheme.v2(),
    purposeIndex,
  );
  const addPurposeResult = await deriveFromRoot({
    db,
    tx: tx1,
    keyInfo: {
      PublicKeyId: null,
      PrivateKeyId: null,
      Index: purposeIndex,
    },
    parentDerivationId: privateDeriver.Bip44DerivationId,
    derivationInfo: id => ({
      Bip44DerivationId: id,
    })
  });

  // Add coin type
  const coinTypeKey = purposeKey.derive(
    RustModule.Wallet.DerivationScheme.v2(),
    coinTypeIndex,
  );
  const addCoinTypeResult = await deriveFromPurpose({
    db,
    tx: tx1,
    keyInfo: {
      PublicKeyId: null,
      PrivateKeyId: null,
      Index: coinTypeIndex,
    },
    parentDerivationId: addPurposeResult.derivationTableResult.Bip44DerivationId,
    derivationInfo: id => ({
      Bip44DerivationId: id,
    })
  });

  await tx1.commit();

  const accountIndex = 0 | HARD_DERIVATION_START;
  const bip44AccountPk = rootPk.bip44_account(
    RustModule.Wallet.AccountIndex.new(accountIndex)
  );
  const bridge = new LovefieldBridge(db);
  const bipWallet = new Bip44Wallet(
    conceptualWallet.ConceptualWalletId,
    wrapper.Bip44WrapperId,
  );
  await bridge.addBip44WalletFunctionality(bipWallet);
  expect(bipWallet instanceof LovefieldDerive).toEqual(true);
  if (!(bipWallet instanceof LovefieldDerive)) {
    throw new Error('should never happen due to assertion above');
  }
  const pubDeriver = await bipWallet.derive({
    publicDeriverInsert: id => ({
      Bip44DerivationId: id,
      Name: 'Checking account',
      LastBlockSync: 0,
    }),
    levelSpecificInsert: {},
    pathToPublic: [
      purposeIndex, coinTypeIndex, accountIndex
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
  });

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

  const externalChain = await deriveFromAccount({
    db,
    tx: tx2,
    parentDerivationId: pubDeriver.Bip44DerivationId,
    keyInfo: {
      PublicKeyId: null,
      PrivateKeyId: null,
      Index: 0,
    },
    derivationInfo: id => ({
      Bip44DerivationId: id,
      LastReceiveIndex: 0,
    }),
  });
  const internalChain = await deriveFromAccount({
    db,
    tx: tx2,
    parentDerivationId: pubDeriver.Bip44DerivationId,
    keyInfo: {
      PublicKeyId: null,
      PrivateKeyId: null,
      Index: 1,
    },
    derivationInfo: id => ({
      Bip44DerivationId: id,
      LastReceiveIndex: null,
    }),
  });

  const addressPk = bip44AccountPk.bip44_chain(false).address_key(RustModule.Wallet.AddressKeyIndex.new(0));
  const addressHash = addressPk.public().bootstrap_era_address(setting).to_base58();
  const address = await deriveFromChain({
    db,
    tx: tx2,
    parentDerivationId: externalChain.derivationTableResult.Bip44DerivationId,
    keyInfo: {
      PublicKeyId: null,
      PrivateKeyId: null,
      Index: 0,
    },
    derivationInfo: id => ({
      Bip44DerivationId: id,
      Hash: addressHash,
    }),
  });

  await tx2.commit();

  const tx3 = db.createTransaction();
  await tx3.begin([
    Bip44DerivationMappingTable, Bip44DerivationTable, Bip44AddressTable,
  ]);
  const addressesForAccount = await getDerivationsByPath(
    db,
    tx3,
    pubDeriver.Bip44DerivationId,
    [purposeIndex, coinTypeIndex, accountIndex],
    [null, null]
  );
  const dbAddresses = await getBip44Address(db, tx3, Array.from(addressesForAccount.keys()));
  const result = dbAddresses.map(row => (
    { hash: row.Hash, addressing: addressesForAccount.get(row.Bip44DerivationId) }
  ));

  await tx3.commit();

  expect(result.length).toEqual(1);
  expect(result[0].hash).toEqual(addressHash);
  expect(result[0].addressing).toEqual([purposeIndex, coinTypeIndex, accountIndex, 0, 0]);

  const bip44Wallets = await getAllBip44Wallets(
    db,
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

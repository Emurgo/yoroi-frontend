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
  deriveFromAccount, deriveFromChain,
  getDerivationsByPath,
  getBip44Address,
} from './genericBip44/api';
import { HARD_DERIVATION_START } from '../../../../../config/numbersConfig';

import { RustModule } from '../../cardanoCrypto/rustLoader';

import { Bip44Wallet } from '../models/Bip44Wallet';
import { LovefieldBridge } from '../bridge/LovefieldBridge';
import { LovefieldDerive } from '../bridge/LovefieldDerive';

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

  const conceptualWallet = await addConceptualWallet({
    db,
    row: {
      CoinType: coinTypeIndex,
      Name: 'My Test Wallet',
    }
  });


  const entropy = RustModule.Wallet.Entropy.from_english_mnemonics(mnemonic);
  const rootPk = RustModule.Wallet.Bip44RootPrivateKey.recover(entropy, '');
  const privateRootKey = await addKey({
    db,
    row: {
      Hash: rootPk.key().to_hex(),
      IsEncrypted: false,
      PasswordLastUpdate: null,
    }
  });
  const addRootResult = await addBip44Root({
    db,
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
  const addPurposeResult = await addBip44Purpose({
    db,
    keyInfo: {
      PublicKeyId: null,
      PrivateKeyId: null,
      Index: purposeIndex,
    },
    derivationInfo: id => ({
      Bip44DerivationId: id,
    })
  });

  // Add coin type
  const coinTypeKey = purposeKey.derive(
    RustModule.Wallet.DerivationScheme.v2(),
    coinTypeIndex,
  );
  const addCoinTypeResult = await addBip44CoinType({
    db,
    keyInfo: {
      PublicKeyId: null,
      PrivateKeyId: null,
      Index: coinTypeIndex,
    },
    derivationInfo: id => ({
      Bip44DerivationId: id,
    })
  });

  const accountIndex = 0 | HARD_DERIVATION_START;
  const bip44AccountPk = rootPk.bip44_account(
    RustModule.Wallet.AccountIndex.new(accountIndex)
  );
  const privateAccountKey = await addKey({
    db,
    row: {
      Hash: bip44AccountPk.key().to_hex(),
      IsEncrypted: false,
      PasswordLastUpdate: null,
    }
  });
  const addAccountResult = await addBip44Account({
    db,
    keyInfo: {
      PublicKeyId: null,
      PrivateKeyId: privateAccountKey.KeyId,
      Index: accountIndex,
    },
    derivationInfo: id => ({
      Bip44DerivationId: id,
    })
  });

  const pubDeriver = await addPublicDeriver({
    db,
    row: {
      Bip44DerivationId: addAccountResult.derivationTableResult.Bip44DerivationId,
      Name: 'Checking account',
      LastBlockSync: 0,
    }
  });

  const externalChain = await deriveFromAccount({
    db,
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

  const addressesForAccount = await getDerivationsByPath(
    db,
    pubDeriver.Bip44DerivationId,
    [purposeIndex, coinTypeIndex, accountIndex],
    [null, null]
  );
  const dbAddresses = await getBip44Address(db, Array.from(addressesForAccount.keys()));
  const result = dbAddresses.map(row => (
    { hash: row.Hash, addressing: addressesForAccount.get(row.Bip44DerivationId) }
  ));

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

  const bridge = new LovefieldBridge(db);
  const bipWallet = new Bip44Wallet(
    conceptualWallet.ConceptualWalletId,
    wrapper.Bip44WrapperId,
  );
  await bridge.addBip44WalletFunctionality(bipWallet);
  expect(bipWallet instanceof LovefieldDerive).toEqual(true);
});

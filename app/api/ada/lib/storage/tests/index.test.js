// @flow

import '../../test-config';
import { loadLovefieldDB } from '../database/index';
import {
  GetAllBip44Wallets,
} from '../database/uncategorized/api/get';
import {
  GetDerivationsByPath,
  GetDerivation,
} from '../database/genericBip44/api/get';
import {
  DerivationLevels,
} from '../database/genericBip44/api/utils';
import type {
  Bip44AddressRow,
} from '../database/genericBip44/tables';
import { HARD_DERIVATION_START } from '../../../../../config/numbersConfig';

import { RustModule } from '../../cardanoCrypto/rustLoader';

import { Bip44Wallet } from '../models/Bip44Wallet';
import { LovefieldBridge } from '../bridge/lovefieldBridge';
import { LovefieldDerive } from '../bridge/lovefieldDerive';
import { WalletBuilder } from '../bridge/walletBuilder';

import { getAllSchemaTables, raii } from '../database/utils';

import { snapshot } from './snapshot';

const mnemonic = 'prevent company field green slot measure chief hero apple task eagle sunset endorse dress seed';
// TODO
// const _password = 'greatest_password_ever';
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
  const firstAccountPk = rootPk.bip44_account(
    RustModule.Wallet.AccountIndex.new(firstAccountIndex)
  );
  const firstAddress = firstAccountPk
    .bip44_chain(false)
    .address_key(RustModule.Wallet.AddressKeyIndex.new(0));
  const firstAddressHash = firstAddress.public().bootstrap_era_address(setting).to_base58();

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
            lastUpdate: null, // purposely null to avoid  diff in test
          },
          publicDeriverPrivateKey: {
            password: null, // TODO
            lastUpdate: null, // purposely null to avoid  diff in test
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
      .deriveFromPublic(
        finalState => ({
          tree: {
            derivationId: finalState.publicDeriver[0].levelResult.Bip44Derivation.Bip44DerivationId,
            children: [
              {
                index: 0, // external chain,
                insert: { LastReceiveIndex: 0 },
                children: [
                  {
                    index: 0,
                    insert: { Hash: firstAddressHash },
                  }
                ],
              },
              {
                index: 1, // internal chain,
                insert: { LastReceiveIndex: null },
                children: [],
              }
            ]
          },
          level: finalState.bip44WrapperRow.PublicDeriverLevel
        })
      )
      .commit();
  }

  // test wallet functionality detection and usage
  {
    const accountIndex = 1 + HARD_DERIVATION_START;
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
    await bipWallet.derive(
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
  }

  // test that all derivations are presetn as expected
  await raii(
    db,
    [
      ...getAllSchemaTables(db, GetDerivationsByPath),
      ...getAllSchemaTables(db, GetDerivation),
    ],
    async tx => {
      const addressesForAccount = await GetDerivationsByPath.get(
        db,
        tx,
        state.publicDeriver[0].levelResult.Bip44Derivation.Bip44DerivationId,
        [purposeIndex, coinTypeIndex, firstAccountIndex],
        [null, null]
      );
      const dbAddresses = await GetDerivation.get<Bip44AddressRow>(
        db,
        tx,
        Array.from(addressesForAccount.keys()),
        DerivationLevels.ADDRESS.level,
      );
      const result = dbAddresses.map(row => (
        { hash: row.Hash, addressing: addressesForAccount.get(row.Bip44DerivationId) }
      ));

      expect(result.length).toEqual(1);
      expect(result[0].hash).toEqual(firstAddressHash);
      expect(result[0].addressing).toEqual([
        purposeIndex, coinTypeIndex, firstAccountIndex, 0, 0
      ]);
    }
  );

  // test GetAllBip44Wallets
  await raii(
    db,
    getAllSchemaTables(db, GetAllBip44Wallets),
    async tx => {
      const bip44Wallets = await GetAllBip44Wallets.get(
        db,
        tx,
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
    }
  );

  // console.log(JSON.stringify(await db.export()));
  expect(JSON.stringify(await db.export())).toEqual(JSON.stringify(snapshot));
});

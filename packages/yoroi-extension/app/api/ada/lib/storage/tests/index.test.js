// @flow

import {
  schema,
} from 'lovefield';
import '../../test-config.forTests';
import { loadLovefieldDB } from '../database/index';
import {
  HARD_DERIVATION_START,
  CoinTypes,
  WalletTypePurpose,
  ChainDerivations,
} from '../../../../../config/numbersConfig';

import {
  UnusedAddressesError,
} from '../../../../common/errors';
import {
  WrongPassphraseError,
} from '../../cardanoCrypto/cryptoErrors';

import { RustModule } from '../../cardanoCrypto/rustLoader';

import {
  Bip44Wallet,
} from '../models/Bip44Wallet/wrapper';
import {
  asPublicFromPrivate,
  asGetPrivateDeriverKey,
} from '../models/ConceptualWallet/traits';
import {
  PublicDeriver,
} from '../models/PublicDeriver/index';
import {
  networks,
} from '../database/prepackaged/networks';
import {
  asAddBip44FromPublic,
  asGetAllUtxos,
  asDisplayCutoff,
  asHasUtxoChains,
  asGetSigningKey,
  asGetPublicKey
} from '../models/PublicDeriver/traits';
import {
  createStandardBip44Wallet,
} from '../bridge/walletBuilder/byron';

jest.mock('../../../../../utils/passwordCipher');
jest.mock('../database/initialSeed');

const mnemonic = 'prevent company field green slot measure chief hero apple task eagle sunset endorse dress seed';

const privateDeriverPassword = 'greatest_password_ever';
const passwordHash = Buffer.from(privateDeriverPassword).toString('hex');

beforeAll(async () => {
  await RustModule.load();
});

// <TODO:PENDING_REMOVAL> bip44, test needs to be updated
test('Can add and fetch address in wallet', async (done) => {
  const network =  networks.CardanoMainnet;

  if (network.BaseConfig[0].ByronNetworkId == null) {
    throw new Error('Should never happen');
  }
  const settings = RustModule.WalletV2.BlockchainSettings.from_json({
    protocol_magic: network.BaseConfig[0].ByronNetworkId,
  });
  const entropy = RustModule.WalletV2.Entropy.from_english_mnemonics(mnemonic);
  const rootPk = RustModule.WalletV2.Bip44RootPrivateKey.recover(entropy, '');

  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);

  const firstAccountIndex = 0 + HARD_DERIVATION_START;
  const firstAccountPk = rootPk.bip44_account(
    RustModule.WalletV2.AccountIndex.new(firstAccountIndex)
  );
  const firstExternalAddressKey = firstAccountPk
    .bip44_chain(false)
    .address_key(RustModule.WalletV2.AddressKeyIndex.new(0));
  const firstExternalAddressHash = firstExternalAddressKey
    .public()
    .bootstrap_era_address(settings)
    .to_base58();

  const state = await createStandardBip44Wallet({
    db,
    rootPk,
    password: privateDeriverPassword,
    accountIndex: HARD_DERIVATION_START + 0,
    walletName: 'My Test Wallet',
    accountName: '',
    network,
  });

  // test wallet functionality detection and usage
  let bipWallet;
  {
    const accountIndex = 1 + HARD_DERIVATION_START;
    bipWallet = await Bip44Wallet.createBip44Wallet(
      db,
      state.bip44WrapperRow,
    );
    const withPublicFromPrivate = asPublicFromPrivate(bipWallet);
    expect(withPublicFromPrivate != null).toEqual(true);
    if (withPublicFromPrivate != null) {
      await withPublicFromPrivate.derivePublicDeriverFromPrivate(
        {
          publicDeriverMeta: {
            name: 'Checking account',
          },
          path: [
            {
              index: WalletTypePurpose.BIP44,
              insert: {},
            },
            {
              index: CoinTypes.CARDANO,
              insert: {},
            },
            {
              index: accountIndex,
              insert: {},
            },
          ],
          decryptPrivateDeriverPassword: privateDeriverPassword,
          initialDerivations: [
            {
              index: 0, // external chain,
              insert: insertRequest => Promise.resolve({
                KeyDerivationId: insertRequest.keyDerivationId,
                DisplayCutoff: 0,
              }),
              children: [],
            },
            {
              index: 1, // internal chain,
              insert: insertRequest => Promise.resolve({
                KeyDerivationId: insertRequest.keyDerivationId,
                DisplayCutoff: null,
              }),
              children: [],
            }
          ]
        },
      );
    }

    const withPrivateDeriverKey = asGetPrivateDeriverKey(bipWallet);
    expect(withPrivateDeriverKey != null).toEqual(true);
    if (withPrivateDeriverKey != null) {
      const key = await withPrivateDeriverKey.getPrivateDeriverKey();
      expect(key.keyDerivation.PrivateKeyId).toEqual(key.keyRow.KeyId);
      expect(key.keyRow.Hash).toEqual(rootPk.key().to_hex() + passwordHash);
      expect(key.keyRow.PasswordLastUpdate).toEqual(null);
      expect(key.keyRow.IsEncrypted).toEqual(true);

      const newDate = new Date(Date.now());
      const newKey = await withPrivateDeriverKey.changePrivateDeriverPassword({
        oldPassword: privateDeriverPassword,
        newPassword: 'asdf',
        currentTime: newDate,
      });
      expect(newKey.Hash).toEqual(rootPk.key().to_hex() + '61736466');
      expect(newKey.PasswordLastUpdate).toEqual(newDate);
      expect(newKey.IsEncrypted).toEqual(true);

      // input previous password to make sure it no longer works
      try {
        await withPrivateDeriverKey.changePrivateDeriverPassword({
          oldPassword: privateDeriverPassword,
          newPassword: 'asdf',
          currentTime: newDate,
        });
        done.fail(new Error('Above function should have thrown'));
      } catch (e) {
        expect(e).toBeInstanceOf(WrongPassphraseError);
      }

      // reset after test
      await withPrivateDeriverKey.changePrivateDeriverPassword({
        oldPassword: 'asdf',
        newPassword: privateDeriverPassword,
        currentTime: key.keyRow.PasswordLastUpdate,
      });
    }
  }

  // test Public Deriver functionality
  {
    const publicDeriver = await PublicDeriver.createPublicDeriver(
      state.publicDeriver[0].publicDeriverResult,
      bipWallet,
    );

    // test renaming conceptual wallet
    {
      await publicDeriver.rename({
        newName: 'rename test',
      });
      const info = await publicDeriver.getFullPublicDeriverInfo();
      expect(info.Name).toEqual('rename test');
      await publicDeriver.rename({
        newName: '',
      });
    }

    const withUtxos = asGetAllUtxos(publicDeriver);
    expect(withUtxos != null).toEqual(true);
    if (withUtxos != null) {
      const addresses = await withUtxos.getAllUtxoAddresses();
      expect(addresses.length).toEqual(40);
      expect(addresses[0].addrs[0].Hash).toEqual(firstExternalAddressHash);
      expect(addresses[0].addressing.path).toEqual([
        WalletTypePurpose.BIP44, CoinTypes.CARDANO, firstAccountIndex, 0, 0
      ]);
    }

    const asGetPublicKeyInstance = asGetPublicKey(publicDeriver);
    expect(asGetPublicKeyInstance != null).toEqual(true);
    if (asGetPublicKeyInstance != null) {
      const pubKey = await asGetPublicKeyInstance.getPublicKey();
      expect(pubKey.Hash).toEqual(firstAccountPk.public().key().to_hex());
    }

    const asHasUtxoChainsInstance = asHasUtxoChains(publicDeriver);
    expect(asHasUtxoChainsInstance != null).toEqual(true);
    if (asHasUtxoChainsInstance != null) {
      const externalAddresses = await asHasUtxoChainsInstance.getAddressesForChain({
        chainId: ChainDerivations.EXTERNAL,
      });
      expect(externalAddresses.length).toEqual(20);
      expect(externalAddresses[0].addrs[0].Hash).toEqual(
        firstAccountPk
          .bip44_chain(false)
          .address_key(RustModule.WalletV2.AddressKeyIndex.new(0))
          .public()
          .bootstrap_era_address(settings)
          .to_base58()
      );

      const internalAddresses = await asHasUtxoChainsInstance.getAddressesForChain({
        chainId: ChainDerivations.INTERNAL,
      });
      expect(internalAddresses.length).toEqual(20);
      expect(internalAddresses[0].addrs[0].Hash).toEqual(
        firstAccountPk
          .bip44_chain(true)
          .address_key(RustModule.WalletV2.AddressKeyIndex.new(0))
          .public()
          .bootstrap_era_address(settings)
          .to_base58()
      );
    }

    const asDisplayCutoffInstance = asDisplayCutoff(publicDeriver);
    expect(asDisplayCutoffInstance != null).toEqual(true);
    if (asDisplayCutoffInstance != null) {
      // test get
      expect(await asDisplayCutoffInstance.getCutoff()).toEqual(0);

      // test pop
      const popped = await asDisplayCutoffInstance.popAddress();
      const nextIndex = 1;
      expect(popped.index).toEqual(nextIndex);
      const expectedAddress = firstAccountPk
        .bip44_chain(false)
        .address_key(RustModule.WalletV2.AddressKeyIndex.new(nextIndex))
        .public()
        .bootstrap_era_address(settings)
        .to_base58();
      expect(popped.addrs[0].Hash).toEqual(expectedAddress);
      expect(await asDisplayCutoffInstance.getCutoff()).toEqual(1);

      // test set
      await asDisplayCutoffInstance.setCutoff({ newIndex: 19 });
      expect(await asDisplayCutoffInstance.getCutoff()).toEqual(19);

      // test pop after no addresses left
      try {
        await asDisplayCutoffInstance.popAddress();
        done.fail(new Error('Above function should have thrown'));
      } catch (e) {
        expect(e).toBeInstanceOf(UnusedAddressesError);
      }

      // reset state after test
      await asDisplayCutoffInstance.setCutoff({ newIndex: 0 });
    }

    const asGetSigningKeyInstance = asGetSigningKey(publicDeriver);
    expect(asGetSigningKeyInstance != null).toEqual(true);
    if (asGetSigningKeyInstance != null) {
      const signingKey = await asGetSigningKeyInstance.getSigningKey();
      expect(signingKey.level).toEqual(0);
      expect(signingKey.row.Hash).toEqual(rootPk.key().to_hex() + passwordHash);

      const normalized = await asGetSigningKeyInstance.normalizeKey({
        ...signingKey,
        password: privateDeriverPassword
      });
      expect(normalized.prvKeyHex).toEqual(firstAccountPk.key().to_hex());
      expect(normalized.pubKeyHex).toEqual(firstAccountPk.public().key().to_hex());

      const newDate = new Date(Date.now());
      const newKey = await asGetSigningKeyInstance.changeSigningKeyPassword({
        oldPassword: privateDeriverPassword,
        newPassword: 'asdf',
        currentTime: newDate,
      });
      expect(newKey.Hash).toEqual(rootPk.key().to_hex() + '61736466');
      expect(newKey.PasswordLastUpdate).toEqual(newDate);
      expect(newKey.IsEncrypted).toEqual(true);

      // reset after test
      await asGetSigningKeyInstance.changeSigningKeyPassword({
        oldPassword: 'asdf',
        newPassword: privateDeriverPassword,
        currentTime: signingKey.row.PasswordLastUpdate,
      });
    }

    const asAddBip44FromPublicInstance = asAddBip44FromPublic(publicDeriver);
    expect(asAddBip44FromPublicInstance != null).toEqual(true);
    if (asAddBip44FromPublicInstance != null) {
      // TODO
    }
  }

  // test renaming conceptual wallet
  {
    await bipWallet.rename({
      newName: 'rename test',
    });
    const info = await bipWallet.getFullConceptualWalletInfo();
    expect(info.Name).toEqual('rename test');
    await bipWallet.rename({
      newName: 'My Test Wallet',
    });
  }

  const dump = (await db.export()).tables;
  expect(dump).toMatchSnapshot();
  done();
});

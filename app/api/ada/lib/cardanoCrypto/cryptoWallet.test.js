// @flow
import '../test-config';
import { RustModule } from './rustLoader';
import { generateLedgerWalletRootKey } from './cryptoWallet';
import {
  ChainDerivations,
  CoinTypes,
  WalletTypePurpose,
  HARD_DERIVATION_START,
} from '../../../../config/numbersConfig';
import { v3PublicToV2 } from '../../transactions/utils';
import { networks } from '../storage/database/prepackagedNetworks';

beforeAll(async () => {
  await RustModule.load();
});

const getAddressForLedgerMnemonic = (mnemonic: string): string => {
  const settings = RustModule.WalletV2.BlockchainSettings.from_json({
    protocol_magic: Number.parseInt(networks.ByronMainnet.NetworkMagic, 10)
  });

  const rootKey = generateLedgerWalletRootKey(mnemonic);
  const firstExternalAddressKey = rootKey
    .derive(WalletTypePurpose.BIP44)
    .derive(CoinTypes.CARDANO)
    .derive(0 + HARD_DERIVATION_START)
    .derive(ChainDerivations.EXTERNAL)
    .derive(0)
    .to_public();

  const v2Key = v3PublicToV2(firstExternalAddressKey);
  const firstExternalAddressHash = v2Key
    .bootstrap_era_address(settings)
    .to_base58();

  return firstExternalAddressHash;
};

test('Generate Ledger wallet', async () => {
  const address1 = getAddressForLedgerMnemonic(
    'correct cherry mammal bubble want mandate polar hazard crater better craft exotic choice fun tourist census gap lottery neglect address glow carry old business'
  );
  expect(address1).toEqual('Ae2tdPwUPEZ2a6sKg6Lu6dysskq549cgj8JyotmCJ3YSxidTSfj9qKRgjKJ');

  const address2 = getAddressForLedgerMnemonic(
    'struggle section scissors siren garbage yellow maximum finger duty require mule earn'
  );
  expect(address2).toEqual('Ae2tdPwUPEZ4Gs4s2recjNjQHBKfuBTkeuqbHJJrC6CuyjGyUD44cCTq4sJ');

  const address3 = getAddressForLedgerMnemonic(
    'vague wrist poet crazy danger dinner grace home naive unfold april exile relief rifle ranch tone betray wrong'
  );
  expect(address3).toEqual('Ae2tdPwUPEZMCGyPAK85FrcserPvzVZZUcbFk5TvDmL9LrUyq2KPYubPcru');

  const address4 = getAddressForLedgerMnemonic(
    'recall grace sport punch exhibit mad harbor stand obey short width stem awkward used stairs wool ugly trap season stove worth toward congress jaguar'
  );
  expect(address4).toEqual('Ae2tdPwUPEZFvG914wGXtCsb9hCr9aKjJC2ZciLKSNRqAKtjnduH7XtPn78');

  const address5 = getAddressForLedgerMnemonic(
    'burden destroy client air agent episode horror orient scrap car point easy local primary grunt seminar goose spin charge olive angry hour start shop'
  );
  expect(address5).toEqual('Ae2tdPwUPEZHiTeWAxzLFm5qYAGqLLwZ35huQJ7Dg5fJ4SN97d1QwhsuDrG');
});

// @flow
import './lib/test-config.forTests';
import { schema } from 'lovefield';
import type { lf$Database } from 'lovefield';
import AdaApi from './index';
import { RustModule } from './lib/cardanoCrypto/rustLoader';
import { generateWalletRootKey } from './lib/cardanoCrypto/cryptoWallet';
import { HARD_DERIVATION_START, WalletTypePurpose, CoinTypes, } from '../../config/numbersConfig';
import {
  silenceLogsForTesting,
} from '../../utils/logging';

import {
  loadLovefieldDB,
} from './lib/storage/database/index';
import { legacyWalletChecksum } from '@emurgo/cip4-js';
import { asGetPublicKey } from './lib/storage/models/PublicDeriver/traits';
import {
  networks,
} from './lib/storage/database/prepackaged/networks';
import BigNumber from 'bignumber.js';
import type { FilterUsedRequest, FilterUsedResponse } from './lib/state-fetch/types';

let db: lf$Database;

describe('app/api/ada/index', () => {
  beforeAll(async () => {
    await RustModule.load();
    db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
    silenceLogsForTesting();
  });

  test('Restore wallet', async () => {
    const restoreRequest = {
      db,
      recoveryPhrase: TX_TEST_MNEMONIC_1,
      walletName: 'mywallet',
      walletPassword: '123',
      network: networks.CardanoMainnet,
      accountIndex: HARD_DERIVATION_START + 0,
    };

    const response = await AdaApi.prototype.restoreWallet(restoreRequest);
    expect(response.publicDerivers.length).toEqual(1);
    const pubDeriver = response.publicDerivers[0];
    const asGetPublicKeyInstance = asGetPublicKey(pubDeriver);
    expect(asGetPublicKeyInstance != null).toEqual(true);
    if (asGetPublicKeyInstance != null) {
      const pubKey = await asGetPublicKeyInstance.getPublicKey();
      const plate = legacyWalletChecksum(pubKey.Hash);
      expect(plate.TextPart).toEqual('SKLE-8430');
    }
  });

  test('Restore wallet for transfer', async () => {
    async function checkAddressesInUse(_body: FilterUsedRequest): Promise<FilterUsedResponse> {
      return [];
    }

    const recoveryPhrase = TX_TEST_MNEMONIC_1;

    const accountIndex = HARD_DERIVATION_START + 0;
    const response  = await AdaApi.prototype.restoreWalletForTransfer({
      accountPubKey: generateWalletRootKey(recoveryPhrase)
        .derive(WalletTypePurpose.BIP44)
        .derive(CoinTypes.CARDANO)
        .derive(accountIndex)
        .to_public(),
      checkAddressesInUse,
      accountIndex,
      network: networks.CardanoMainnet,
    });

    expect(response).toEqual(RESTORED_ADDRESSES);
  });

  const TX_TEST_MNEMONIC_1 = 'prevent company field green slot measure chief hero apple task eagle sunset endorse dress seed';

  const RESTORED_ADDRESSES = {
    addresses: [{
      address: 'Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 0]
      }
    }, {
      address: 'Ae2tdPwUPEZFXnw5T5aXoaP28yw4mRLeYomaG9mPGCFbPUtw368ZWYKp1zM',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 1]
      }
    }, {
      address: 'Ae2tdPwUPEZ8gpDazyi8VtcGMnMrkpKxts6ppCT45mdT6WMZEwHXs7pP8Tg',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 2]
      }
    }, {
      address: 'Ae2tdPwUPEZBFhEBZgvm3fQeuW2zBPochfQehFtXn6tCRQy7zsQ9Px88jsH',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 3]
      }
    }, {
      address: 'Ae2tdPwUPEZ6tzHKyuMLL6bh1au5DETgb53PTmJAN9aaCLtaUTWHvrS2mxo',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 4]
      }
    }, {
      address: 'Ae2tdPwUPEYxzZH7sSyyXK6DDmjCxRajXUXFqbEjtxfPN7HZzQfXr4hxKwT',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 5]
      }
    }, {
      address: 'Ae2tdPwUPEZMUQdcxu6AEoq9wzL8mtSCKhWUNhYjXqq1aenwimnLaCit1FY',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 6]
      }
    }, {
      address: 'Ae2tdPwUPEYw9VvB1BQqgGd8XzNfgz4mv9gBjB9P8EtvPQfz4D8Gt4xnQog',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 7]
      }
    }, {
      address: 'Ae2tdPwUPEYxYn4T89ffVqpDwqwsMDAZTcfnWBqAkjoem5sgaVKGU3FUB2E',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 8]
      }
    }, {
      address: 'Ae2tdPwUPEZBZ9aYboQuf5PFcjuZRCosBhLkUCxSQw1vqk3iyK5qGo5CJWe',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 9]
      }
    }, {
      address: 'Ae2tdPwUPEZ4yCaYs3j7pPPaM9iA3KLruJkKjmUBBLKYzpJUHutWdS6EkKa',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 10]
      }
    }, {
      address: 'Ae2tdPwUPEZ5zV8wqC9gPvkDtr2MS3Ys2vQbyPdM4wsdnzevbqnaJFg62hk',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 11]
      }
    }, {
      address: 'Ae2tdPwUPEZAD1KmgTQ4zS6Q5s4VXWDXqB3ZmM1abQGoyrGN8qCsZyXc3vf',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 12]
      }
    }, {
      address: 'Ae2tdPwUPEZ1SFwQMGroCTabfCPJ1RiK8D2F11C1vTMi14tX1XK2uogRWqM',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 13]
      }
    }, {
      address: 'Ae2tdPwUPEZJ8CiSFVipoupUVBGRAVbmbpmKPCXsExcwzZd6FcNpAcExY1r',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 14]
      }
    }, {
      address: 'Ae2tdPwUPEZCeLRPNcreMQAAfJFs9ZzBeFK9pUXhMnL3ooQP9TajasVsYKK',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 15]
      }
    }, {
      address: 'Ae2tdPwUPEZGvzYwTSUZhTxDviZSKqLZDYVkcT4rLqckFXvdTMv21CinTCd',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 16]
      }
    }, {
      address: 'Ae2tdPwUPEZKEsQJxXQvRJHLCWRGFQNWFgHhroEw9GGXV25wRBH8TAmwCRi',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 17]
      }
    }, {
      address: 'Ae2tdPwUPEZ6u2i2u4iLhd9Rq4rUBsVaMpqQWuTCXMitMmugcsr9iANjNEE',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 18]
      }
    }, {
      address: 'Ae2tdPwUPEYxsngJhnW49jrmGuaCvQK34Hqrnx5w5SWxgfjDkSDcnrRdT5G',
      addressing: {
        startLevel: 3,
        path: [2147483648, 0, 19]
      }
    }, {
      address: 'Ae2tdPwUPEZ3Kt2BJnDMQggxEA4c9MTagByH41rJkv2k82dBch2nqMAdyHJ',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 0]
      }
    }, {
      address: 'Ae2tdPwUPEYzRJEAdyX24mYTmKx8dMHYQgxkBcgnsdFHPPvmySMS9cspZmj',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 1]
      }
    }, {
      address: 'Ae2tdPwUPEZ5yxTy5wcVmUXP5xkkDSXfrgqWp8Px6knmUiFjJEytBGXfWoS',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 2]
      }
    }, {
      address: 'Ae2tdPwUPEZ3pKEVL1tMmz8EzaE9Hyn2cVJKf3TFVCjw7xeLFBdJngUXPXG',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 3]
      }
    }, {
      address: 'Ae2tdPwUPEZLhFMGWjMpCWwsUiN58DkKmtg6r7dFJfXhmUyzNGPb2Crg141',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 4]
      }
    }, {
      address: 'Ae2tdPwUPEZBTYWkpudmAYdyQM9CHcV9orEVnVSan6EP2xNApB5bLE1XsKF',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 5]
      }
    }, {
      address: 'Ae2tdPwUPEYzdEoDVNdvLz6kFgVsjEyUJ1z3mHzAT1HotQk31tRvGNM4tge',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 6]
      }
    }, {
      address: 'Ae2tdPwUPEZ2NvzdECB18z3SBTc8SVvx1PJuxPKsnncygEZeeKNaAeBeLDg',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 7]
      }
    }, {
      address: 'Ae2tdPwUPEZ3iMfnFWSM3zeqpNwAdT62jNgiA27x1ZEacpfVbViYWb7gyNP',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 8]
      }
    }, {
      address: 'Ae2tdPwUPEYykz6FbkuRf9ScRwZc8F1xobMPyzECjsdMyqobn2tVpL6pdDW',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 9]
      }
    }, {
      address: 'Ae2tdPwUPEZ8SUET76NhRhJ6TNLW48csZ4e87hu6JYobQvVTKSYDMPBU5Xa',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 10]
      }
    }, {
      address: 'Ae2tdPwUPEZBryPRKuib729PQNSBxzgXsTVwmg3CWQjZaAS7pj4WZNa3VR6',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 11]
      }
    }, {
      address: 'Ae2tdPwUPEZ6yyMqXFEYmLvqXqktpU8LR6oW8qVbaap7R2YJGc9xDbs2Eb6',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 12]
      }
    }, {
      address: 'Ae2tdPwUPEZ4gRK6Qhj3Mo4tSU4LkRiqVgsQm6rg8YBGC6fqVLNqA9REr7c',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 13]
      }
    }, {
      address: 'Ae2tdPwUPEZ3xWm3GHFVNtVWcnyTGpSF6AjyhZJY3DuSGvf3WvwLzkBisFw',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 14]
      }
    }, {
      address: 'Ae2tdPwUPEZL9BqYXyY6zQQoatsWbkcN6g46NfvCfaE8mQppcVgentdAXeo',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 15]
      }
    }, {
      address: 'Ae2tdPwUPEYzxRSsoqFY2Ym7zQfSdosY1bdK8KZTEjPjcobHd3GbZ3qZpvB',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 16]
      }
    }, {
      address: 'Ae2tdPwUPEZEdntBfWRH5ucNrQd7RwPjZ2QZEkxJbsJDBrCGnTtjqfb8Aph',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 17]
      }
    }, {
      address: 'Ae2tdPwUPEZKDMDuUZBUSokAzeJwNpqHorYEPuycXBMMFameoVFkxwpLheC',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 18]
      }
    }, {
      address: 'Ae2tdPwUPEZ2E4XNPVarvndsmkC8n2vS9rXJfCxny9oVacViLRDpeKioaAc',
      addressing: {
        startLevel: 3,
        path: [2147483648, 1, 19]
      }
    }]
  };

  test('create tx', async () => {
    const createTxRequest = {
      absSlotNumber: new BigNumber('70858976'),
      receivers: [
        {
          address: '00ca292fa69ed94a6fbaa4747797dc08a0c0b0831a83d960a320179ab2c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e'
        },
        {
          address: '005ef516805e1fed9d3aa2c78c7599e931cd9c5d914c372eb2728006cfc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
          addressing: {
            path: [
              2147485500,
              2147485463,
              2147483648,
              1,
              585
            ],
            startLevel: 1
          }
        }
      ],
      network: {
        NetworkId: 300,
        NetworkName: 'Cardano Legacy Testnet',
        Backend: {
          BackendService: 'https://testnet-backend.yoroiwallet.com',
          TokenInfoService: 'https://stage-cdn.yoroiwallet.com',
          BackendServiceZero: 'placeholder',
        },
        BaseConfig: [
          {
            StartAt: 0,
            ChainNetworkId: '0',
            ByronNetworkId: 1097911063,
            GenesisDate: '1563999616000',
            SlotsPerEpoch: 21600,
            SlotDuration: 20
          },
          {
            StartAt: 74,
            SlotsPerEpoch: 432000,
            SlotDuration: 1,
            PerEpochPercentageReward: 69344,
            LinearFee: {
              coefficient: '44',
              constant: '155381'
            },
            CoinsPerUtxoWord: '34482',
            MinimumUtxoVal: '1000000',
            PoolDeposit: '500000000',
            KeyDeposit: '2000000'
          },
          {
            CoinsPerUtxoByte: '4310',
          }
        ],
        CoinType: 2147485463,
        Fork: 0
      },
      defaultToken: {
        defaultNetworkId: 300,
        defaultIdentifier: ''
      },
      utxos: [
        {
          amount: '10000000',
          receiver: '6085abf3eca55024aa1c22b944599b5e890ec12dfb19941229da4ba293',
          tx_hash: 'fa489b6c954ff298ab307a7433f33fa508a3504de04190533a5541905728292c',
          tx_index: 1,
          utxo_id: 'fa489b6c954ff298ab307a7433f33fa508a3504de04190533a5541905728292c1',
          addressing: {
            path: [
              2147485500,
              2147485463,
              2147483648,
              0,
              0
            ],
            startLevel: 1
          },
          assets: [
            {
              amount: '45000000',
              assetId: 'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c.474f4c44',
              policyId: 'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c',
              name: '474f4c44'
            },
          ]
        },
      ],
      tokens: [
        {
          token: {
            TokenId: 4,
            NetworkId: 300,
            IsDefault: true,
            IsNFT: false,
            Identifier: '',
            Digest: -6.1389758346808205e-55,
            Metadata: {
              type: 'Cardano',
              policyId: '',
              assetName: '',
              ticker: 'TADA',
              longName: null,
              logo: null,
              numberOfDecimals: 6
            }
          },
          amount: '1000000',
          shouldSendAll: false
        }
      ],
      metadata: undefined,
    }
    const response = await AdaApi.prototype.createUnsignedTxForUtxos(createTxRequest);

    expect(response.senderUtxos).toEqual(
      [
        {
          amount: '10000000',
          receiver: '6085abf3eca55024aa1c22b944599b5e890ec12dfb19941229da4ba293',
          tx_hash: 'fa489b6c954ff298ab307a7433f33fa508a3504de04190533a5541905728292c',
          tx_index: 1,
          utxo_id: 'fa489b6c954ff298ab307a7433f33fa508a3504de04190533a5541905728292c1',
          addressing: {
            path: [
              2147485500,
              2147485463,
              2147483648,
              0,
              0
            ],
            startLevel: 1
          },
          assets: [
            {
              amount: '45000000',
              assetId: 'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c.474f4c44',
              policyId: 'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c',
              name: '474f4c44'
            },
          ]
        },
      ]
    );
    expect(response.changeAddr.length).toBe(1);

    expect(response.changeAddr[0].address).toBe(
      '005ef516805e1fed9d3aa2c78c7599e931cd9c5d914c372eb2728006cfc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e'
    );
    expect(response.changeAddr[0].addressing).toEqual(
      {
        path: [
          2147485500,
          2147485463,
          2147483648,
          1,
          585
        ],
        startLevel: 1
      }
    );
    expect(response.changeAddr[0].values.values).toEqual(
      [
        {
          identifier: '',
          networkId: 300,
          amount: new BigNumber('8812631')
        },
        {
          amount: new BigNumber('45000000'),
          identifier: 'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c.474f4c44',
          networkId: 300,
        },
      ]
    );

    expect(response.unsignedTx.get_fee_if_set()?.to_str()).toEqual('187369');

    function cmpOutputs(o1: any, o2: any): number {
      if (o1.address > o2.address) {
        return 1;
      }
      if (o1.address < o2.address) {
        return -1;
      }
      return Number(o1.amount.coin) - Number(o2.amount.coin);
    }

    const txJson = JSON.parse(response.unsignedTx.build_tx().to_json());
    const ref = {
      auxiliary_data: null,
      body: {
        auxiliary_data_hash: null,
        certs: null,
        collateral: null,
        collateral_return: null,
        current_treasury_value: null,
        donation: null,
        fee: '187369',
        inputs: [
          {
            index: 1,
            transaction_id: 'fa489b6c954ff298ab307a7433f33fa508a3504de04190533a5541905728292c'
          }
        ],
        mint: null,
        network_id: null,
        outputs: [
          {
            address: 'addr_test1qr9zjtaxnmv55ma65368097upzsvpvyrr2pajc9ryqte4vkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qfwzsgx',
            amount: {
              coin: '1000000',
              multiasset: null
            },
            plutus_data: null,
            script_ref: null
          },
          {
            address: 'addr_test1qp00295qtc07m8f65trccaveaycum8zaj9xrwt4jw2qqdn7r3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qn97ahn',
            amount: {
              coin: '1000000',
              multiasset: null
            },
            plutus_data: null,
            script_ref: null
          },
          {
            address: 'addr_test1qp00295qtc07m8f65trccaveaycum8zaj9xrwt4jw2qqdn7r3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qn97ahn',
            amount: {
              coin: '1000000',
              multiasset: null
            },
            plutus_data: null,
            script_ref: null
          },
          {
            address: 'addr_test1qp00295qtc07m8f65trccaveaycum8zaj9xrwt4jw2qqdn7r3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qn97ahn',
            amount: {
              coin: '1000000',
              multiasset: null
            },
            plutus_data: null,
            script_ref: null
          },
          {
            address: 'addr_test1qp00295qtc07m8f65trccaveaycum8zaj9xrwt4jw2qqdn7r3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qn97ahn',
            amount: {
              coin: '1000000',
              multiasset: null
            },
            plutus_data: null,
            script_ref: null
          },
          {
            address: 'addr_test1qp00295qtc07m8f65trccaveaycum8zaj9xrwt4jw2qqdn7r3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qn97ahn',
            amount: {
              coin: '1000000',
              multiasset: null
            },
            plutus_data: null,
            script_ref: null
          },
          {
            address: 'addr_test1qp00295qtc07m8f65trccaveaycum8zaj9xrwt4jw2qqdn7r3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qn97ahn',
            amount: {
              coin: '1155080',
              multiasset: {
                'c85f714f2187021c7bab53741f659d0c5b1a6e7529d32b7794ff051c': {
                  '474f4c44': '45000000',
                },
              },
            },
            plutus_data: null,
            script_ref: null,
          },
          {
            address: 'addr_test1qp00295qtc07m8f65trccaveaycum8zaj9xrwt4jw2qqdn7r3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qn97ahn',
            amount: {
              coin: '2657551',
              multiasset: null
            },
            plutus_data: null,
            script_ref: null
          }
        ],
        reference_inputs: null,
        required_signers: null,
        script_data_hash: null,
        total_collateral: null,
        ttl: '70866176',
        update: null,
        validity_start_interval: null,
        voting_procedures: null,
        voting_proposals: null,
        withdrawals: null
      },
      is_valid: true,
      witness_set: {
        bootstraps: null,
        native_scripts: null,
        plutus_data: null,
        plutus_scripts: null,
        redeemers: null,
        vkeys: null
      }
    };
    txJson.body.outputs.sort(cmpOutputs);
    ref.body.outputs.sort(cmpOutputs);
    expect(txJson).toEqual(ref);

  });
});

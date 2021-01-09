// @flow

import '../../lib/test-config';
import BigNumber from 'bignumber.js';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import {
  createLedgerSignTxPayload,
  buildSignedTransaction,
  toLedgerAddressParameters,
} from './ledgerTx';
import {
  byronAddrToHex,
  getCardanoSpendingKeyHash,
  normalizeToAddress,
} from '../../lib/storage/bridge/utils';
import { HaskellShelleyTxSignRequest } from './HaskellShelleyTxSignRequest';
import { AddressTypeNibbles, CertificateTypes } from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { networks } from '../../lib/storage/database/prepackaged/networks';
import { HARD_DERIVATION_START, WalletTypePurpose, CoinTypes, ChainDerivations } from '../../../../config/numbersConfig';

beforeAll(async () => {
  await RustModule.load();
});

const network = networks.CardanoMainnet;

function getProtocolParams(): {|
  linearFee: RustModule.WalletV4.LinearFee,
  minimumUtxoVal: RustModule.WalletV4.BigNum,
  poolDeposit: RustModule.WalletV4.BigNum,
  keyDeposit: RustModule.WalletV4.BigNum,
  networkId: number,
  |} {
  return {
    linearFee: RustModule.WalletV4.LinearFee.new(
      RustModule.WalletV4.BigNum.from_str('2'),
      RustModule.WalletV4.BigNum.from_str('500'),
    ),
    minimumUtxoVal: RustModule.WalletV4.BigNum.from_str('1'),
    poolDeposit: RustModule.WalletV4.BigNum.from_str('500'),
    keyDeposit: RustModule.WalletV4.BigNum.from_str('500'),
    networkId: network.NetworkId,
  };
}


test('Generate address parameters', async () => {
  const baseConfig = network.BaseConfig
    .reduce((acc, next) => Object.assign(acc, next), {});
  const { ByronNetworkId, ChainNetworkId } = baseConfig;

  const path = [WalletTypePurpose.BIP44, CoinTypes.CARDANO, HARD_DERIVATION_START, 1, 1];

  // byron
  {
    const addr = 'Ae2tdPwUPEZLmqiKtMQ4kKL38emRfkyPqBsHqL64pf8uRz6uzsQCd7GAu9R';
    const wasmAddr = normalizeToAddress(addr);
    if (wasmAddr == null) throw new Error(`Unknown address`);
    expect(toLedgerAddressParameters({
      address: wasmAddr,
      networkId: Number.parseInt(ChainNetworkId, 10),
      path,
      addressingMap: () => undefined,
    })).toEqual({
      addressTypeNibble: AddressTypeNibbles.BYRON,
      networkIdOrProtocolMagic: ByronNetworkId,
      spendingPath: path,
      stakingBlockchainPointer: undefined,
      stakingKeyHashHex: undefined,
      stakingPath: undefined,
    });
  }

  // base (staking key)
  {
    const addr = 'addr1q8v42wjda8r6mpfj40d36znlgfdcqp7jtj03ah8skh6u8wnrqua2vw243tmjfjt0h5wsru6appuz8c0pfd75ur7myyeqsx9990';
    const wasmAddr = normalizeToAddress(addr);
    if (wasmAddr == null) throw new Error(`Unknown address`);
    expect(toLedgerAddressParameters({
      address: wasmAddr,
      networkId: Number.parseInt(ChainNetworkId, 10),
      path,
      addressingMap: () => undefined,
    })).toEqual({
      addressTypeNibble: AddressTypeNibbles.BASE,
      networkIdOrProtocolMagic: Number.parseInt(ChainNetworkId, 10),
      spendingPath: path,
      stakingBlockchainPointer: undefined,
      stakingKeyHashHex: '63073aa639558af724c96fbd1d01f35d087823e1e14b7d4e0fdb2132',
      stakingPath: undefined,
    });
  }

  // base (path)
  {
    const stakingKeyPath = [
      WalletTypePurpose.CIP1852,
      CoinTypes.CARDANO,
      HARD_DERIVATION_START,
      2,
      0
    ];
    const addr = 'addr1q8v42wjda8r6mpfj40d36znlgfdcqp7jtj03ah8skh6u8wnrqua2vw243tmjfjt0h5wsru6appuz8c0pfd75ur7myyeqsx9990';
    const wasmAddr = normalizeToAddress(addr);
    if (wasmAddr == null) throw new Error(`Unknown address`);
    expect(toLedgerAddressParameters({
      address: wasmAddr,
      path,
      networkId: Number.parseInt(ChainNetworkId, 10),
      addressingMap: (address) => {
        if (address === 'e163073aa639558af724c96fbd1d01f35d087823e1e14b7d4e0fdb2132') {
          return {
            startLevel: 1,
            path: stakingKeyPath,
          };
        }
        return undefined;
      },
    })).toEqual({
      addressTypeNibble: AddressTypeNibbles.BASE,
      networkIdOrProtocolMagic: Number.parseInt(ChainNetworkId, 10),
      spendingPath: path,
      stakingBlockchainPointer: undefined,
      stakingKeyHashHex: undefined,
      stakingPath: stakingKeyPath,
    });
  }

  // enterprise
  {
    const addr = 'addr1vxq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92su77c6m';
    const wasmAddr = normalizeToAddress(addr);
    if (wasmAddr == null) throw new Error(`Unknown address`);
    expect(toLedgerAddressParameters({
      address: wasmAddr,
      networkId: Number.parseInt(ChainNetworkId, 10),
      path,
      addressingMap: () => undefined,
    })).toEqual({
      addressTypeNibble: AddressTypeNibbles.ENTERPRISE,
      networkIdOrProtocolMagic: Number.parseInt(ChainNetworkId, 10),
      spendingPath: path,
      stakingBlockchainPointer: undefined,
      stakingKeyHashHex: undefined,
      stakingPath: undefined,
    });
  }

  // pointer
  {
    const addr = 'addr1gxq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92spqgpsl97q83';
    const wasmAddr = normalizeToAddress(addr);
    if (wasmAddr == null) throw new Error(`Unknown address`);
    expect(toLedgerAddressParameters({
      address: wasmAddr,
      networkId: Number.parseInt(ChainNetworkId, 10),
      path,
      addressingMap: () => undefined,
    })).toEqual({
      addressTypeNibble: AddressTypeNibbles.POINTER,
      networkIdOrProtocolMagic: Number.parseInt(ChainNetworkId, 10),
      spendingPath: path,
      stakingBlockchainPointer: {
        blockIndex: 1,
        certificateIndex: 3,
        txIndex: 2,
      },
      stakingKeyHashHex: undefined,
      stakingPath: undefined,
    });
  }

  // reward
  {
    const addr = 'stake1u8pcjgmx7962w6hey5hhsd502araxp26kdtgagakhaqtq8squng76';
    const stakingKeyPath = [
      WalletTypePurpose.CIP1852,
      CoinTypes.CARDANO,
      HARD_DERIVATION_START,
      2,
      0
    ];
    const wasmAddr = normalizeToAddress(addr);
    if (wasmAddr == null) throw new Error(`Unknown address`);
    expect(toLedgerAddressParameters({
      address: wasmAddr,
      networkId: Number.parseInt(ChainNetworkId, 10),
      path: stakingKeyPath,
      addressingMap: () => undefined,
    })).toEqual({
      addressTypeNibble: AddressTypeNibbles.REWARD,
      networkIdOrProtocolMagic: Number.parseInt(ChainNetworkId, 10),
      spendingPath: stakingKeyPath,
      stakingBlockchainPointer: undefined,
      stakingKeyHashHex: undefined,
      stakingPath: undefined,
    });
  }
});


test('Create Ledger transaction', async () => {
  const senderUtxos = [{
    amount: '1494128',
    receiver: 'Ae2tdPwUPEZLmqiKtMQ4kKL38emRfkyPqBsHqL64pf8uRz6uzsQCd7GAu9R',
    tx_hash: '058405892f66075d83abd1b7fe341d2d5bfd2f6122b2f874700039e5078e0dd5',
    tx_index: 1,
    utxo_id: '058405892f66075d83abd1b7fe341d2d5bfd2f6122b2f874700039e5078e0dd51',
    addressing: {
      path: [WalletTypePurpose.BIP44, CoinTypes.CARDANO, HARD_DERIVATION_START, 1, 1],
      startLevel: 1
    }
  }, {
    amount: '2832006',
    // base
    receiver: 'addr1q8v42wjda8r6mpfj40d36znlgfdcqp7jtj03ah8skh6u8wnrqua2vw243tmjfjt0h5wsru6appuz8c0pfd75ur7myyeqsx9990',
    tx_hash: '3677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba20',
    tx_index: 1,
    utxo_id: '3677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba201',
    addressing: {
      path: [WalletTypePurpose.BIP44, CoinTypes.CARDANO, HARD_DERIVATION_START, 1, 2],
      startLevel: 1
    }
  }, {
    amount: '1000000',
    // enterprise
    receiver: 'addr1vxq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92su77c6m',
    tx_hash: '1029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b3657',
    tx_index: 0,
    utxo_id: '1029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b36570',
    addressing: {
      path: [WalletTypePurpose.BIP44, CoinTypes.CARDANO, HARD_DERIVATION_START, 0, 7],
      startLevel: 1
    }
  }, {
    amount: '1000000',
    // pointer
    receiver: 'addr1gxq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92spqgpsl97q83',
    tx_hash: '2029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b3658',
    tx_index: 0,
    utxo_id: '2029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b36571',
    addressing: {
      path: [WalletTypePurpose.BIP44, CoinTypes.CARDANO, HARD_DERIVATION_START, 0, 7],
      startLevel: 1
    }
  }];
  const protocolParams = getProtocolParams();
  const txBuilder = RustModule.WalletV4.TransactionBuilder.new(
    protocolParams.linearFee,
    protocolParams.minimumUtxoVal,
    protocolParams.poolDeposit,
    protocolParams.keyDeposit,
  );
  for (const utxo of senderUtxos) {
    const wasmAddr = normalizeToAddress(utxo.receiver);
    if (wasmAddr == null) throw new Error(`Unknown address ${utxo.receiver}`);
    const keyHash = getCardanoSpendingKeyHash(wasmAddr);
    if (keyHash === undefined) throw new Error(`Unexpected script address ${utxo.receiver}`);
    if (keyHash == null) {
      txBuilder.add_bootstrap_input(
        RustModule.WalletV4.ByronAddress.from_base58(utxo.receiver),
        RustModule.WalletV4.TransactionInput.new(
          RustModule.WalletV4.TransactionHash.from_bytes(Buffer.from(utxo.tx_hash, 'hex')),
          1
        ),
        RustModule.WalletV4.BigNum.from_str(utxo.amount)
      );
    } else {
      txBuilder.add_key_input(
        keyHash,
        RustModule.WalletV4.TransactionInput.new(
          RustModule.WalletV4.TransactionHash.from_bytes(Buffer.from(utxo.tx_hash, 'hex')),
          1
        ),
        RustModule.WalletV4.BigNum.from_str(utxo.amount)
      );
    }
  }
  txBuilder.add_output(
    RustModule.WalletV4.TransactionOutput.new(
      RustModule.WalletV4.Address.from_bytes(Buffer.from(byronAddrToHex('Ae2tdPwUPEZAVDjkPPpwDhXMSAjH53CDmd2xMwuR9tZMAZWxLhFphrHKHXe'), 'hex')),
      RustModule.WalletV4.BigNum.from_str('5326134')
    )
  );
  const certs = RustModule.WalletV4.Certificates.new();

  // note: key doesn't belong to the account signing. Just used to test witness generation
  const accountKey = RustModule.WalletV4.Bip32PrivateKey.from_bytes(
    Buffer.from(
      '408a1cb637d615c49e8696c30dd54883302a20a7b9b8a9d1c307d2ed3cd50758c9402acd000461a8fc0f25728666e6d3b86d031b8eea8d2f69b21e8aa6ba2b153e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
      'hex',
    ),
  );
  const stakingKey = accountKey.derive(ChainDerivations.CHIMERIC_ACCOUNT).derive(0);

  const stakeCredential = RustModule.WalletV4.StakeCredential.from_keyhash(
    stakingKey.to_raw_key().to_public().hash()
  );
  certs.add(RustModule.WalletV4.Certificate.new_stake_registration(
    RustModule.WalletV4.StakeRegistration.new(stakeCredential)
  ));
  txBuilder.set_certs(certs);
  txBuilder.set_fee(RustModule.WalletV4.BigNum.from_str('1000'));
  txBuilder.set_ttl(500);

  const baseConfig = network.BaseConfig
    .reduce((acc, next) => Object.assign(acc, next), {});
  const { ByronNetworkId, ChainNetworkId } = baseConfig;

  const stakingKeyInfo = {
    keyHash: stakingKey.to_public().to_raw_key().hash(),
    addressing: {
      startLevel: 1,
      path: [
        WalletTypePurpose.CIP1852,
        CoinTypes.CARDANO,
        HARD_DERIVATION_START,
        2,
        0,
      ],
    },
  };
  const signRequest = new HaskellShelleyTxSignRequest(
    {
      unsignedTx: txBuilder,
      changeAddr: [],
      senderUtxos,
      certificate: undefined,
    },
    undefined,
    {
      ChainNetworkId: Number.parseInt(baseConfig.ChainNetworkId, 10),
      PoolDeposit: new BigNumber(baseConfig.PoolDeposit),
      KeyDeposit: new BigNumber(baseConfig.KeyDeposit),
      NetworkId: network.NetworkId,
    },
    {
      neededHashes: new Set([Buffer.from(stakeCredential.to_bytes()).toString('hex')]),
      wits: new Set() // not needed for this test, but something should be here
    },
  );

  const rewardAddressString = Buffer.from(
    RustModule.WalletV4.RewardAddress.new(
      Number.parseInt(baseConfig.ChainNetworkId, 10),
      stakeCredential
    ).to_address().to_bytes()
  ).toString('hex');
  const response = await createLedgerSignTxPayload({
    signRequest,
    byronNetworkMagic: ByronNetworkId,
    networkId: Number.parseInt(ChainNetworkId, 10),
    addressingMap: (address) => {
      if (address === rewardAddressString) {
        return stakingKeyInfo.addressing;
      }
      return undefined;
    },
  });

  expect(response).toStrictEqual({
    feeStr: '1000',
    ttlStr: '500',
    networkId: 1,
    protocolMagic: 764824073,
    inputs: [{
      path: [
        44 + HARD_DERIVATION_START,
        1815 + HARD_DERIVATION_START,
        0 + HARD_DERIVATION_START,
        1,
        1,
      ],
      txHashHex: '058405892f66075d83abd1b7fe341d2d5bfd2f6122b2f874700039e5078e0dd5',
      outputIndex: 1,
    }, {
      path: [
        44 + HARD_DERIVATION_START,
        1815 + HARD_DERIVATION_START,
        0 + HARD_DERIVATION_START,
        1,
        2,
      ],
      txHashHex: '3677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba20',
      outputIndex: 1,
    }, {
      path: [
        44 + HARD_DERIVATION_START,
        1815 + HARD_DERIVATION_START,
        0 + HARD_DERIVATION_START,
        0,
        7,
      ],
      txHashHex: '1029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b3657',
      outputIndex: 0,
    }, {
      path: [
        44 + HARD_DERIVATION_START,
        1815 + HARD_DERIVATION_START,
        0 + HARD_DERIVATION_START,
        0,
        7,
      ],
      txHashHex: '2029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b3658',
      outputIndex: 0,
    }],
    outputs: [{
      addressHex: '82d818582183581c891ac9abaac999b097c81ea3c0450b0fbb693d0bd232bebc0f4a391fa0001af2ff7e21',
      amountStr: `5326134`
    }],
    withdrawals: [],
    certificates: [{
      path: [
        WalletTypePurpose.CIP1852,
        CoinTypes.CARDANO,
        HARD_DERIVATION_START,
        2,
        0,
      ],
      poolKeyHashHex: undefined,
      poolRegistrationParams: undefined,
      type: CertificateTypes.STAKE_REGISTRATION,
    }],
    metadataHashHex: undefined,
  });

  buildSignedTransaction(
    txBuilder.build(),
    signRequest.signRequest.senderUtxos,
    [
      // this witnesses doesn't belong to the transaction / key. Just used to test wit generation
      {
        path: [WalletTypePurpose.CIP1852, CoinTypes.CARDANO, HARD_DERIVATION_START, 1, 1],
        witnessSignatureHex: 'dc273ee8929c240f95b27b29b53043eb31dc1a5d8c1ba4a44b678bc97bb84db34c05144b50df954e1ac73dec1d33df06e4d95c3c7874458e7fea873c90614207',
      },
      {
        path: [WalletTypePurpose.BIP44, CoinTypes.CARDANO, HARD_DERIVATION_START, 1, 1],
        witnessSignatureHex: 'dc273ee8929c240f95b27b29b53043eb31dc1a5d8c1ba4a44b678bc97bb84db34c05144b50df954e1ac73dec1d33df06e4d95c3c7874458e7fea873c90614207',
      },
      {
        path: [WalletTypePurpose.BIP44, CoinTypes.CARDANO, HARD_DERIVATION_START, 1, 2],
        witnessSignatureHex: 'dc273ee8929c240f95b27b29b53043eb31dc1a5d8c1ba4a44b678bc97bb84db34c05144b50df954e1ac73dec1d33df06e4d95c3c7874458e7fea873c90614207',
      },
      {
        path: [WalletTypePurpose.BIP44, CoinTypes.CARDANO, HARD_DERIVATION_START, 0, 7],
        witnessSignatureHex: 'dc273ee8929c240f95b27b29b53043eb31dc1a5d8c1ba4a44b678bc97bb84db34c05144b50df954e1ac73dec1d33df06e4d95c3c7874458e7fea873c90614207',
      },
      {
        path: [WalletTypePurpose.BIP44, CoinTypes.CARDANO, HARD_DERIVATION_START, 2, 0],
        witnessSignatureHex: 'dc273ee8929c240f95b27b29b53043eb31dc1a5d8c1ba4a44b678bc97bb84db34c05144b50df954e1ac73dec1d33df06e4d95c3c7874458e7fea873c90614207',
      },
    ],
    {
      addressing: {
        startLevel: 1,
        path: [
          WalletTypePurpose.CIP1852,
          CoinTypes.CARDANO,
          HARD_DERIVATION_START,
        ],
      },
      key: accountKey.to_public(),
    },
    undefined,
  );
});

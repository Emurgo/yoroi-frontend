/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
// @flow //
import React from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import {
  AddressType,
  CertificateType,
  TransactionSigningMode,
  TxAuxiliaryDataType,
  TxOutputDestinationType,
  CredentialParamsType,
  CIP36VoteRegistrationFormat,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import type { TransportIdType } from '../../types/enum';
import {
  OPERATION_NAME,
  TRANSPORT_ID,
} from '../../types/enum';
import type {
  setLocaleFunc,
  setTransportFunc,
} from '../../types/func';
import { YOROI_LEDGER_CONNECT_TARGET_NAME } from '../../const';
import { SUPPORTED_LOCALS } from '../../i18n/translations';
import type {
  SignTransactionRequest,
  DeriveAddressRequest,
  GetExtendedPublicKeyRequest,
  GetExtendedPublicKeysRequest,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import type {
  ShowAddressRequestWrapper,
} from '../../types/cmn';

import styles from './TestBlock.scss';

const MainnetIds = Object.freeze({
  protocolMagic: 764824073, // for legacy Byron-era addresses
  chainNetworkId: 1, // for Shelley-era addresses
});

type Props = {|
  setLocale: setLocaleFunc,
  setTransport: setTransportFunc,
  currentTransportId: TransportIdType,
  currentLocale: string
|};

type State = {|
  visible: string,
  /** we can't change what Ledger query we're doing or how it's done once started */
  startedQuery: boolean,
|};

function strToPath(str: string): Array<number> {
  return str.split('/').map(s => {
    if (s.endsWith('\'')) {
      return 0x80000000 + Number(s.slice(0, -1));
    }
    return Number(s);
  });
}

@observer
export default class TestBlock extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      visible: `${styles.visible}`,
      startedQuery: false,
    };
  }

  onCompClicked: () => void = () => {
    this.setState({ visible: `${styles.visible}` });
  }

  onCompDoubleClicked: () => void = () => {
    this.setState({ visible: `${styles.hidden}` });
  }

  setStartedQuery: () => void = () => {
    this.setState({ startedQuery: true });
  }

  onLangSelectionChange: (string) => void = (locale) => {
    if (this.props.currentTransportId !== locale &&
      this.state.visible === `${styles.visible}`
    ) {
      this.props.setLocale(locale);
      console.debug(`[YLC] Language Selection Changed to : ${locale}`);
    }
  };

  onTransportSelectionChange: (TransportIdType) => void  = (transportId) => {
    if (this.props.currentLocale !== transportId &&
      this.state.visible === `${styles.visible}`
    ) {
      this.props.setTransport(transportId);
      console.debug(`[YLC] Transport Selection Changed to : ${transportId}`);
    }
  };

  render(): Node {
    const supportedLocals = (
      SUPPORTED_LOCALS.map(locale => {
        return (
          <div key={locale}>
            <input
              type="radio"
              name="language"
              id={locale}
              checked={this.props.currentLocale === locale}
              onChange={this.onLangSelectionChange.bind(this, locale)}
            />
            <label htmlFor={locale}>{locale}</label>
          </div>
        );
      })
    );

    const transportSelection = (
      <div className={styles.transportSelection}>
        {Object.keys(TRANSPORT_ID).map(key => {
          if (Object.prototype.hasOwnProperty.call(TRANSPORT_ID, key)) {
            const transportId = TRANSPORT_ID[key];
            return (
              <span key={transportId}>
                <input
                  key={transportId}
                  type="radio"
                  name="transport"
                  id={transportId}
                  checked={this.props.currentTransportId === transportId}
                  onChange={this.onTransportSelectionChange.bind(this, transportId)}
                />
                <label className={styles.tranportLabel} htmlFor={transportId}>{transportId}</label>
              </span>
            );
          }
          return null;
        })}
      </div>
    );

    const operationSelection = (
      <div className={styles.operationSelection}>
        <div>
          <button type="button" onClick={this.onExtendedByronPublicKey}>Extended Single Byron key</button>
          <button type="button" onClick={this.onExtendedShelleyPublicKey}>Extended Single Shelley key</button>
        </div>
        <div>
          <button type="button" onClick={this.onExtendedMultiByronPublicKey}>Extended Many Byron key</button>
          <button type="button" onClick={this.onExtendedMultiShelleyPublicKey}>Extended Many Shelley key</button>
        </div>
        <div>
          <button type="button" onClick={this.onSignTransaction}>Sign transaction</button>
          <button type="button" onClick={this.onCatalystRegistrationSignTransaction}>
            Sign CIP-15 transaction
          </button>
          <button type="button" onClick={this.onSignMultiAssetTransaction}>
            Sign a multi-asset transaction
          </button>
        </div>
        <div>
          <button type="button" onClick={this.onShowByronAddress}>Verify Byron address</button>
          <button type="button" onClick={this.onShowBasePathAddress}>Verify base path address</button>
          <button type="button" onClick={this.onShowBaseHexAddress}>Verify base hex address</button>
          <button type="button" onClick={this.onShowPointerAddress}>Verify pointer address</button>
          <button type="button" onClick={this.onShowEnterpriseAddress}>Verify enterprise address</button>
          <button type="button" onClick={this.onShowRewardAddress}>Verify reward address</button>
        </div>
        <div>
          <button type="button" onClick={this.onDeriveByronAddress}>Derive Byron address</button>
          <button type="button" onClick={this.onDeriveBasePathAddress}>Derive base path address</button>
          <button type="button" onClick={this.onDeriveBaseHexAddress}>Derive base hex address</button>
          <button type="button" onClick={this.onDerivePointerAddress}>Derive pointer address</button>
          <button type="button" onClick={this.onDeriveEnterpriseAddress}>Derive enterprise address</button>
          <button type="button" onClick={this.onDeriveRewardAddress}>Derive reward address</button>
        </div>
        <button type="button" onClick={this.onLogVersion}>Device version</button>
        <button type="button" onClick={this.onLogSerial}>Serial number</button>
      </div>
    );

    const visibilityInfo = (
      <div className={styles.visibilityInfo}>
        *Double click=invisible | single click=visible again
      </div>
    );

    return (
      <div
        className={`${styles.component} ${this.state.visible}`}
        onClick={this.onCompClicked}
        onDoubleClick={this.onCompDoubleClicked}
      >
        <div className={styles.column1}>
          {supportedLocals}
        </div>
        {this.state.startedQuery === false && (
          <div className={styles.column2}>
            {transportSelection}
            {operationSelection}
            {visibilityInfo}
          </div>
        )}
      </div>
    );
  }

  /**
   * Test getVersion
   */
  onLogVersion: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const req = this.makeRequest(
        OPERATION_NAME.GET_LEDGER_VERSION,
        null
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onLogVersion`);
  }

  /**
   * Test getSerial
   */
  onLogSerial: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const req = this.makeRequest(
        OPERATION_NAME.GET_SERIAL,
        null
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onLogSerial`);
  }

  /**
   * Test getExtendedPublicKey
   */
  onExtendedByronPublicKey: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const path = strToPath("44'/1815'/0'");

      const req = this.makeRequest(
        OPERATION_NAME.GET_EXTENDED_PUBLIC_KEY,
        ({ path }: GetExtendedPublicKeyRequest)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onExtendedByronPublicKey`);
  }
  onExtendedShelleyPublicKey: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const path = strToPath("1852'/1815'/0'");

      const req = this.makeRequest(
        OPERATION_NAME.GET_EXTENDED_PUBLIC_KEY,
        ({ path }: GetExtendedPublicKeyRequest)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onExtendedByronPublicKey`);
  }

  /**
   * Test getExtendedPublicKey
   */
  onExtendedMultiByronPublicKey: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const paths = [
        strToPath("44'/1815'/0'"),
        strToPath("44'/1815'/1'"),
      ];

      const req = this.makeRequest(
        OPERATION_NAME.GET_EXTENDED_PUBLIC_KEYS,
        ({ paths }: GetExtendedPublicKeysRequest)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onExtendedMultiByronPublicKey`);
  }
  onExtendedMultiShelleyPublicKey: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const paths = [
        strToPath("1852'/1815'/0'"),
        strToPath("1852'/1815'/1'"),
      ];

      const req = this.makeRequest(
        OPERATION_NAME.GET_EXTENDED_PUBLIC_KEYS,
        ({ paths }: GetExtendedPublicKeysRequest)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onExtendedMultiShelleyPublicKey`);
  }

  /**
   * Test signTransaction
   */
  onSignTransaction: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const inputs = [
        {
          txHashHex: 'e3a768c5b3109fa3268d875316063809a298602a272d7933c2b4443b69058d7a',
          outputIndex: 0,
          path: strToPath("1852'/1815'/0'/0/0")
        }
      ];

      const outputs = [
        {
          amount: '700000',
          destination: {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
              // Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf
              addressHex: '82d818582183581c9f01f38ec3af8341f45a301b075bfd6fd0cfbaddb01c5ebe780918b9a0001adb482c56',
            },
          },
        },
        {
          destination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
              params: {
                spendingPath: strToPath("1852'/1815'/0'/0/0"),
                stakingPath: strToPath("1852'/1815'/0'/2/0"),
              },
            },
          },
          amount: '100000',
        },
        {
          destination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
              params: {
                spendingPath: strToPath("1852'/1815'/0'/0/0"),
                stakingKeyHashHex: '0f662d6ceb1b65733a69a1ed72f86f0bac5a16505a028897af1be345',
              },
            },
          },
          amount: '100000',
        }
      ];

      const req = this.makeRequest(
        OPERATION_NAME.SIGN_TX,
        ({
          signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
          tx: {
            network: {
              networkId: MainnetIds.chainNetworkId,
              protocolMagic: MainnetIds.protocolMagic,
            },
            inputs,
            outputs,
            fee: '500',
            ttl: '20',
            certificates: [{
              type: CertificateType.STAKE_REGISTRATION,
              params: {
                stakeCredential: {
                  type: CredentialParamsType.KEY_PATH,
                  keyPath: strToPath("1852'/1815'/0'/2/0"),
                },
              }
            },
            {
              type: CertificateType.STAKE_DELEGATION,
              params: {
                stakeCredential: {
                  type: CredentialParamsType.KEY_PATH,
                  keyPath: strToPath("1852'/1815'/0'/2/0"),
                },
                poolKeyHashHex: 'df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207',
              }
            },
            {
              type: CertificateType.STAKE_DEREGISTRATION,
              params: {
                stakeCredential: {
                  type: CredentialParamsType.KEY_PATH,
                  keyPath: strToPath("1852'/1815'/0'/2/0"),
                },
              },
            }],
            withdrawals: [{
              stakeCredential: {
                type: CredentialParamsType.KEY_PATH,
                keyPath: strToPath("1852'/1815'/0'/2/0"),
              },
              amount: '1000000',
            }],
            auxiliaryData: {
              type: TxAuxiliaryDataType.ARBITRARY_HASH,
              params: {
                hashHex: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
              }
            }
          },
          additionalWitnessPaths: [],
        }: SignTransactionRequest)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onSignTransaction`);
  }

  onSignMultiAssetTransaction: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const inputs = [
        {
          txHashHex: 'e3a768c5b3109fa3268d875316063809a298602a272d7933c2b4443b69058d7a',
          outputIndex: 0,
          path: strToPath("1852'/1815'/0'/0/0")
        }
      ];

      const outputs = [
        {
          amount: '700000',
          destination: {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
              // Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf
              addressHex: '82d818582183581c9f01f38ec3af8341f45a301b075bfd6fd0cfbaddb01c5ebe780918b9a0001adb482c56',
            },
          },
          tokenBundle: [
            {
              policyIdHex: '16af70780a170994e8e5e575f4401b1d89bddf7d1a11d6264e0b0c85',
              tokens: [
                {
                  amount: '1',
                  assetNameHex: '74426967546f6b656e4e616d653132'
                }
              ]
            },
            {
              policyIdHex: '2c9d0ecfc2ee1288056df15be4196d8ded73db345ea5b4cd5c7fac3f',
              tokens: [
                {
                  amount: '1',
                  assetNameHex: '76737562737465737435'
                }
              ]
            },
            {
              policyIdHex: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
              tokens: [
                {
                  amount: '2',
                  assetNameHex: ''
                }
              ]
            }
          ],
        },
        {
          destination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
              params: {
                spendingPath: strToPath("1852'/1815'/0'/0/0"),
                stakingPath: strToPath("1852'/1815'/0'/2/0"),
              },
            },
          },
          amount: '100000',
        },
      ];

      const req = this.makeRequest(
        OPERATION_NAME.SIGN_TX,
        ({
          signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
          tx: {
            network: {
              networkId: MainnetIds.chainNetworkId,
              protocolMagic: MainnetIds.protocolMagic,
            },
            inputs,
            outputs,
            fee: '500',
            ttl: '20',
          },
          additionalWitnessPaths: [],
        }: SignTransactionRequest)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onSignMultiAssetTransaction`);
  }

  onCatalystRegistrationSignTransaction: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const inputs = [
        {
          txHashHex: 'e3a768c5b3109fa3268d875316063809a298602a272d7933c2b4443b69058d7a',
          outputIndex: 0,
          path: strToPath("1852'/1815'/0'/0/0")
        }
      ];

      const outputs = [
        {
          amount: '700000',
          destination: {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
              // Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf
              addressHex: '82d818582183581c9f01f38ec3af8341f45a301b075bfd6fd0cfbaddb01c5ebe780918b9a0001adb482c56',
            },
          },
        },
        {
          destination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
              params: {
                spendingPath: strToPath("1852'/1815'/0'/0/0"),
                stakingPath: strToPath("1852'/1815'/0'/2/0"),
              },
            },
          },
          amount: '100000',
        },
        {
          destination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
              params: {
                spendingPath: strToPath("1852'/1815'/0'/0/0"),
                stakingKeyHashHex: '0f662d6ceb1b65733a69a1ed72f86f0bac5a16505a028897af1be345',
              },
            },
          },
          amount: '100000',
        }
      ];

      const req = this.makeRequest(
        OPERATION_NAME.SIGN_TX,
        ({
          signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
          tx: {
            network: {
              networkId: MainnetIds.chainNetworkId,
              protocolMagic: MainnetIds.protocolMagic,
            },
            inputs,
            outputs,
            fee: '500',
            ttl: '20',
            auxiliaryData: {
              type: TxAuxiliaryDataType.CIP36_REGISTRATION,
              params: {
                format: CIP36VoteRegistrationFormat.CIP_15,
                voteKeyHex: '47ca0e9ba5f671a494067098affc86426401102094138b2300caf694d6a9f4fc',
                stakingPath: strToPath("1852'/1815'/0'/2/0"),
                paymentDestination: {
                  type: TxOutputDestinationType.DEVICE_OWNED,
                  params: {
                    type: AddressType.REWARD_KEY,
                    params: {
                      stakingPath: strToPath("1852'/1815'/0'/2/0"),
                    },
                  },
                },
                nonce: 0,
              }
            }
          },
          additionalWitnessPaths: [],
        }: SignTransactionRequest)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onSignCatalystRegistrationTransaction`);
  }

  /**
   * Test showAddress = Verify Address
   */
  onShowByronAddress: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const req = this.makeRequest(
        OPERATION_NAME.SHOW_ADDRESS,
        ({
          expectedAddr: 'Ae2tdPwUPEZ46CWnexxkBpEM4Y1Y2QQxz8zDE9TtFK6PjM7xsizBAPShHVV',
          address: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
              spendingPath: strToPath("1852'/1815'/0'/0/0"),
              stakingPath: strToPath("1852'/1815'/0'/2/0"),
            },
          },
          network: {
            networkId: MainnetIds.chainNetworkId,
            protocolMagic: MainnetIds.protocolMagic,
          },
        }: ShowAddressRequestWrapper)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onShowAddress`);
  }
  onShowBasePathAddress: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const req = this.makeRequest(
        OPERATION_NAME.SHOW_ADDRESS,
        ({
          expectedAddr: 'addr1qxf84wnw7ez8s0clpchhxlrx7a8mrsx9f9n2xjfazlc62tnvz7nwqamg2fan294qzxlt89nt0ez4xzxpw4vtg7h2fggqgse4hr',
          address: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
              spendingPath: strToPath("1852'/1815'/0'/0/0"),
              stakingPath: strToPath("1852'/1815'/0'/2/0"),
            },
          },
          network: {
            networkId: MainnetIds.chainNetworkId,
            protocolMagic: MainnetIds.protocolMagic,
          },
        }: ShowAddressRequestWrapper)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onDeriveAddress`);
  }
  onShowBaseHexAddress: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const req = this.makeRequest(
        OPERATION_NAME.SHOW_ADDRESS,
        ({
          expectedAddr: 'addr1qxf84wnw7ez8s0clpchhxlrx7a8mrsx9f9n2xjfazlc62tnvz7nwqamg2fan294qzxlt89nt0ez4xzxpw4vtg7h2fggqgse4hr',
          address: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
              spendingPath: strToPath("1852'/1815'/0'/0/0"),
              stakingKeyHashHex: '927aba6ef644783f1f0e2f737c66f74fb1c0c54966a3493d17f1a52e',
            },
          },
          network: {
            networkId: MainnetIds.chainNetworkId,
            protocolMagic: MainnetIds.protocolMagic,
          },
        }: ShowAddressRequestWrapper)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onDeriveAddress`);
  }
  onShowPointerAddress: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const req = this.makeRequest(
        OPERATION_NAME.SHOW_ADDRESS,
        ({
          expectedAddr: 'addr1gxf84wnw7ez8s0clpchhxlrx7a8mrsx9f9n2xjfazlc62tsqqypqv2s002',
          address: {
            type: AddressType.POINTER_KEY,
            params: {
              spendingPath: strToPath("1852'/1815'/0'/0/0"),
              stakingBlockchainPointer: {
                blockIndex: 0,
                txIndex: 1,
                certificateIndex: 2,
              }
            },
          },
          network: {
            networkId: MainnetIds.chainNetworkId,
            protocolMagic: MainnetIds.protocolMagic,
          },
        }: ShowAddressRequestWrapper)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onDeriveAddress`);
  }
  onShowEnterpriseAddress: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const req = this.makeRequest(
        OPERATION_NAME.SHOW_ADDRESS,
        ({
          expectedAddr: 'addr1vxf84wnw7ez8s0clpchhxlrx7a8mrsx9f9n2xjfazlc62tsmdww5t',
          address: {
            type: AddressType.ENTERPRISE_KEY,
            params: {
              spendingPath: strToPath("1852'/1815'/0'/0/0"),
            },
          },
          network: {
            networkId: MainnetIds.chainNetworkId,
            protocolMagic: MainnetIds.protocolMagic,
          },
        }: ShowAddressRequestWrapper)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onDeriveAddress`);
  }
  onShowRewardAddress: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const req = this.makeRequest(
        OPERATION_NAME.SHOW_ADDRESS,
        ({
          expectedAddr: 'addr1u8pcjgmx7962w6hey5hhsd502araxp26kdtgagakhaqtq8sxy9w7g',
          network: {
            networkId: MainnetIds.chainNetworkId,
            protocolMagic: MainnetIds.protocolMagic,
          },
          address: {
            type: AddressType.REWARD_KEY,
            params: {
              stakingPath: strToPath("1852'/1815'/0'/2/0"),
            },
          }
        }: ShowAddressRequestWrapper)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onDeriveAddress`);
  }

  /**
   * Test deriveAddress
   */
  onDeriveByronAddress: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const req = this.makeRequest(
        OPERATION_NAME.DERIVE_ADDRESS,
        ({
          address: {
            type: AddressType.BYRON,
            params: {
              spendingPath: strToPath("44'/1815'/0'/0/0"),
            },
          },
          network: {
            networkId: MainnetIds.chainNetworkId,
            protocolMagic: MainnetIds.protocolMagic,
          },
        }: DeriveAddressRequest)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onDeriveAddress`);
  }
  onDeriveBasePathAddress: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const req = this.makeRequest(
        OPERATION_NAME.DERIVE_ADDRESS,
        ({
          address: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
              spendingPath: strToPath("1852'/1815'/0'/0/0"),
              stakingPath: strToPath("1852'/1815'/0'/2/0"),
            },
          },
          network: {
            networkId: MainnetIds.chainNetworkId,
            protocolMagic: MainnetIds.protocolMagic,
          },
        }: DeriveAddressRequest)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onDeriveAddress`);
  }
  onDeriveBaseHexAddress: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const req = this.makeRequest(
        OPERATION_NAME.DERIVE_ADDRESS,
        ({
          address: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
              spendingPath: strToPath("1852'/1815'/0'/0/0"),
              stakingKeyHashHex: '927aba6ef644783f1f0e2f737c66f74fb1c0c54966a3493d17f1a52e',
            },
          },
          network: {
            networkId: MainnetIds.chainNetworkId,
            protocolMagic: MainnetIds.protocolMagic,
          },
        }: DeriveAddressRequest)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onDeriveAddress`);
  }
  onDerivePointerAddress: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const req = this.makeRequest(
        OPERATION_NAME.DERIVE_ADDRESS,
        ({
          address: {
            type: AddressType.POINTER_KEY,
            params: {
              spendingPath: strToPath("1852'/1815'/0'/0/0"),
              stakingBlockchainPointer: {
                blockIndex: 0,
                txIndex: 1,
                certificateIndex: 2,
              }
            },
          },
          network: {
            networkId: MainnetIds.chainNetworkId,
            protocolMagic: MainnetIds.protocolMagic,
          },
        }: DeriveAddressRequest)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onDeriveAddress`);
  }
  onDeriveEnterpriseAddress: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const req = this.makeRequest(
        OPERATION_NAME.DERIVE_ADDRESS,
        ({
          address: {
            type: AddressType.ENTERPRISE_KEY,
            params: {
              spendingPath: strToPath("1852'/1815'/0'/0/0"),
            },
          },
          network: {
            networkId: MainnetIds.chainNetworkId,
            protocolMagic: MainnetIds.protocolMagic,
          },
        }: DeriveAddressRequest)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onDeriveAddress`);
  }
  onDeriveRewardAddress: () => void = () => {
    if (this.state.visible === `${styles.visible}`) {
      const req = this.makeRequest(
        OPERATION_NAME.DERIVE_ADDRESS,
        ({
          address: {
            type: AddressType.REWARD_KEY,
            params: {
              stakingPath: strToPath("1852'/1815'/0'/2/0"),
            },
          },
          network: {
            networkId: MainnetIds.chainNetworkId,
            protocolMagic: MainnetIds.protocolMagic,
          },
        }: DeriveAddressRequest)
      );
      window.postMessage(req);
    }
    console.debug(`[YLC] TEST:onDeriveAddress`);
  }

  /**
   * Makes Request object
   */
  makeRequest: (string, any) => any = (action, params) => {
    this.setStartedQuery();
    return {
      action,
      params,
      target: YOROI_LEDGER_CONNECT_TARGET_NAME,
    };
  }
}

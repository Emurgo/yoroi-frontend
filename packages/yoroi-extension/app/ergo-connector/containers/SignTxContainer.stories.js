// @flow

import React from 'react';
import type { Node, ComponentType } from 'react';
import SignTxContainer from './SignTxContainer';
import { withScreenshot } from 'storycap';
import { action } from '@storybook/addon-actions';
import { MemoryRouter } from 'react-router';
import Layout from '../components/layout/Layout';

export default {
  title: `${__filename.split('.')[0]}`,
  component: SignTxContainer,
  decorators: [
    (Story: ComponentType<any>): Node => (
      <MemoryRouter>
        <Layout>
          <Story />
        </Layout>
      </MemoryRouter>
    ),
    withScreenshot,
  ],
};

const message = {
  sign: {
    type: 'tx',
    uid: 0,
    tx: {
      id: '2df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a175',
      inputs: [{
        boxId: '1df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a174',
        extension: {},
      }],
      dataInputs: [{
        boxId: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a173',
      }],
      outputs: [{
        boxId: '3df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a176',
        value: '1234567',
        ergoTree: '1234',
        assets: [{
          amount: 12340,
          tokenId: '33a35e15ae1a83fa188674a2bd53007b07e119a0eaaf40b890b2081c2864f12a',
        }],
        additionalRegisters: Object.freeze({
          'R4': '0e03555344',
          'R5': '0e184e6f7468696e67206261636b65642055534420746f6b656e',
          'R6': '0e0132',
        }),
        creationHeight: 1,
        transactionId: "2df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a175",
        index: 0
      }],
    },
  },
  tabId: 0,
};

const genBaseProps: {||} => * = () => {
  return {
    stores: {
      connector: {
        signingMessage: message,
        totalAmount: 5,
      },
      uiNotifications: {
        getTooltipActiveNotification: (_id) => undefined,
        isOpen: (_clazz) => false,
      },
    },
    actions: {
      notifications: {
        closeActiveNotification: {
          trigger: action('closeActiveNotification'),
        },
        open: {
          trigger: action('open'),
        },
      },
      connector: {
        cancelSignInTx: {
          trigger: action('cancelSignInTx'),
        },
        confirmSignInTx: {
          trigger: action('confirmSignInTx'),
        },
      },
    },
  };
};

export const Generic = (): Node => {
  return (
    <SignTxContainer
      generated={genBaseProps(Object.freeze({}))}
    />
  );
};

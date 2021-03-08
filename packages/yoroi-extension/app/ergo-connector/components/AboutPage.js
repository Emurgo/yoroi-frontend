// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import styles from './AboutPage.scss';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {||};

{
  /* TODO: fix text for about */
}
const messages = defineMessages({
  dAppInfo: {
    id: 'connector.settings.about.dAppInfo',
    defaultMessage: '!!!What is dApp connector?',
  },
  dAppDescription: {
    id: 'connector.settings.about.dAppDescription',
    defaultMessage:
      '!!!The dApp connector allows dApps (decentralized applications) in the form of web pages to interact in a secure manner with the user\'s Yoroi Ergo wallets to enable smart contract functionality.',
  },
  howItWorks: {
    id: 'connector.settings.about.howItWorks',
    defaultMessage: `!!!How does it work?`,
  },
  howItWorksDescription: {
    id: 'connector.settings.about.howItWorksDescription',
    defaultMessage:
      '!!!The connector exposes a javascript interface to web pages you visit, specified by the Ergo EIP-0012 standard, allowing dApps to request read-only access to a user\'s Yoroi Ergo wallet. If the user gives access to a dApp, the dApp can read, but not change, the user\'s balance and addresses. The dApp can also request that the user sign a transaction, such as a smart contract created using the address information supplied via this connector. Private keys/passwords are never exposed to dApps, and all transaction signing is done within Yoroi and only with explicit user confirmation.',
  },
});

export default class AboutPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = { intl: intlShape.isRequired };

  render(): Node {
    const { intl } = this.context;

    return (
      <div className={styles.component}>
        <h1>{intl.formatMessage(messages.dAppInfo)}</h1>
        <p>{intl.formatMessage(messages.dAppDescription)}</p>
        <h1>{intl.formatMessage(messages.howItWorks)}</h1>
        <p>{intl.formatMessage(messages.howItWorksDescription)}</p>
      </div>
    );
  }
}

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
      '!!!Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio, voluptatem animi necessitatibus error libero natus ea obcaecati, illum hic sunt dolorem neque asperiores magnam consequuntur quia quo ad deserunt. Molestias.',
  },
  howItWorks: {
    id: 'connector.settings.about.howItWorks',
    defaultMessage: `!!!How does it work?`,
  },
  howItWorksDescription: {
    id: 'connector.settings.about.howItWorksDescription',
    defaultMessage:
      '!!!Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio, voluptatem animi necessitatibus error libero natus ea obcaecati, illum hic sunt dolorem neque asperiores magnam consequuntur quia quo ad deserunt. Molestias.',
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

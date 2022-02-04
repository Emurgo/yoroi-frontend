// @flow
import { Component } from 'react';
import type { Node } from 'react';
import styles from './Permissions.scss'
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import Video from '../../../assets/images/dapp-connector/video.inline.svg'


const messages = defineMessages({
    header: {
        id: 'connector.connectedWebsites.permissions.header',
        defaultMessage: '!!!Enable Yoroi to access dApps',
    },
    firstBlockHeader: {
      id: 'connector.connectedWebsites.permissions.firstBlockHeader',
      defaultMessage: '!!!Why do you need dApp connector?',
    },
    firstBlockText: {
      id: 'connector.connectedWebsites.permissions.firstBlockText',
      defaultMessage: '!!!DApp connector will allow the interaction between your Yoroi wallets and any Cardano dApps. You will be able to participate in any activities that the dApp permits such as purchasing or selling tokens, gaining access to resources, or using other features offered by the dApp.'
    },
    secondBlockHeader: {
      id: 'connector.connectedWebsites.permissions.secondBlockHeader',
      defaultMessage: '!!!How does it work?',
    },
    secondBlockTextPt1: {
      id: 'connector.connectedWebsites.permissions.secondBlockTextPt1',
      defaultMessage: '!!!Follow the link to see'
    },
    secondBlockTextPt2: {
      id: 'connector.connectedWebsites.permissions.secondBlockTextPt2',
      defaultMessage: '!!!and guide on how to work with the enabled dApp connector.'
    },
    videoLink: {
      id: 'connector.connectedWebsites.permissions.videoLink',
      defaultMessage: '!!!the video introduction'
    },
    enable: {
      id: 'connector.connectedWebsites.permissions.enable',
      defaultMessage: '!!!enable'
    }
})

export default class Permissions extends Component {
    static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
        intl: intlShape.isRequired,
    };

    render(): Node {
        const { intl } = this.context

        return (
          <div className={styles.component}>
            <div className={styles.centered}>
              <h1 className={styles.mainHeader}>{intl.formatMessage(messages.header)}</h1>

              <div className={styles.block}>
                <div className={styles.icon}>
                  <Video />
                </div>
                <div className={styles.blockContent}>
                  <h2 className={styles.blockHeader}>
                    {intl.formatMessage(messages.firstBlockHeader)}
                  </h2>
                  <p className={styles.blockText}>{intl.formatMessage(messages.firstBlockText)}</p>
                </div>
              </div>
              <div className={styles.block}>
                <div className={styles.icon}>
                  <Video />
                </div>
                <div className={styles.blockContent}>
                  <h2 className={styles.blockHeader}>
                    {intl.formatMessage(messages.secondBlockHeader)}
                  </h2>
                  <p className={styles.blockText}>
                    <span>{intl.formatMessage(messages.secondBlockTextPt1)}</span>
                    <span><a href="go">{intl.formatMessage(messages.videoLink)}</a></span>
                    <span>{intl.formatMessage(messages.secondBlockTextPt2)}</span>
                  </p>
                </div>
              </div>

              <div>
                <button type='button'>{intl.formatMessage(messages.enable)}</button>
              </div>
            </div>
          </div>
        )
    }
}
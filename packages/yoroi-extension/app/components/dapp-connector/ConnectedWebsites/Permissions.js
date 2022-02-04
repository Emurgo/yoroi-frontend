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
              <h1>{intl.formatMessage(messages.header)}</h1>

              <div>
                <div>
                  <Video />
                </div>

              </div>
            </div>
          </div>
        )
    }
}
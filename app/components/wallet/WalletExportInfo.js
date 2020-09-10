// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';

import styles from './WalletExportInfo.scss';

const titleLine1 = 'The Shelley testnet is over';
const titleLine2 = 'You have to download the mainnet version of Yoroi to delegate your ADA';

const actionLine1 = 'If you remember your recovery phrase, you can claim your ITN rewards inside the mainnet Yoroi through its "transfer/claim" page';
const actionLine2 = 'If you do not remember your recovery phrase, but you remember your spending password,';
const actionLine3 = 'Copy the private key below and enter it into the mainnet Yoroi extension through its "transfer/claim" page';
const actionLine4 = `Then enter your ITN wallet's spending password as the "decryption password"`;

type Props = {|
  privateKey: ?string,
|};

@observer
export default class WalletExportInfo extends Component<Props> {
  render(): Node {
    return (
      <div className={styles.component}>
        <div className={styles.title}>
          {titleLine1}<br /><br />
          {titleLine2}
        </div>
        {actionLine1}<br /><br /><br /><br />
        {this.props.privateKey != null && (
          <>
            {actionLine2}<br /><br />
            {actionLine3}<br /><br />
            {actionLine4}
            <code>
              {this.props.privateKey}
            </code>
          </>
        )}
      </div>
    );
  }
}

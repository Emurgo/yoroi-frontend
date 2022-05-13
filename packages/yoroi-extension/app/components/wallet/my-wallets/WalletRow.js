// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import styles from './WalletRow.scss';

import { ReactComponent as ToggleIcon }  from '../../../assets/images/my-wallets/arrow_down.inline.svg';
import { ReactComponent as SettingsIcon }  from '../../../assets/images/sidebar/wallet-settings-2-ic.inline.svg';

type Props = {|
  +walletSumDetails: Node,
  +walletSumCurrencies:  Node,
  +walletSubRow: () => Node,
  +walletPlate:  Node,
  +walletSync:  Node,
  +onRowClicked: void => void,
  +onSettings: void => void,
  +isExpandable: boolean,
|};

type State = {|
  isExpanded: boolean,
|};


@observer
export default class WalletRow extends Component<Props, State> {
  state: State = {
    isExpanded: false,
  };

  toggleExpansion() {
    this.setState(prevState => ({ isExpanded: !prevState.isExpanded }));
  }

  render(): Node {
    const { isExpanded } = this.state;

    const {
      walletSumDetails,
      walletSumCurrencies,
      walletSubRow,
      walletPlate,
      walletSync,
      onRowClicked,
      isExpandable,
    } = this.props;

    return (
      <div
        className={classnames([styles.wrapper, isExpanded && styles.wrapperExpanded])}
      >
        <div className={styles.content}>
          <div className={styles.settingSection}>
            <button
              type="button"
              onClick={this.props.onSettings}
              className={styles.settingButton}
            >
              <SettingsIcon width="30" height="30" />
            </button>
          </div>
          <button
            className={styles.nameSection}
            onClick={onRowClicked}
            type="button"
          >
            {walletPlate}
          </button>
          <div className={styles.detailsSection}>
            {walletSumDetails}
          </div>
          <div className={styles.syncSection}>
            {walletSync}
          </div>
          <div className={styles.currencySection}>
            {walletSumCurrencies}
          </div>
          {/*
          <div className={styles.addSection}>
            <button
              type="button"
              className={styles.add}
            >
              <PlusIcon />
            </button>
          </div>
          */}
          {isExpandable && (
            <button
              type="button"
              className={classnames([styles.toggle, isExpanded && styles.toggleExpanded])}
              onClick={this.toggleExpansion.bind(this)}
            >
              <ToggleIcon />
            </button>
          )}
        </div>
        {isExpandable && isExpanded && (<div className={styles.contentBody}>{walletSubRow()}</div>)}
      </div>
    );
  }
}

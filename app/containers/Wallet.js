import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'material-ui/Tabs';
import WalletInfo from '../components/WalletInfo';
import { toPublicHex } from '../utils/crypto/cryptoUtils';

class Wallet extends Component {
  constructor(props) {
    super(props);
    //TODO: Fetch walletInfo!
  }

  getAddress = (wallet) => {
    return toPublicHex(wallet);
  };

  render() {
    return (
      <Tabs>
        <Tab label="Receive">
          <div>
            <WalletInfo
              address={this.getAddress(this.props.wallet)}
              balance={0}
              txs={[]}
            />
          </div>
        </Tab>
        <Tab label="Send">
          <div>
            <h1>Send FORM</h1>
          </div>
        </Tab>
      </Tabs>
    );
  }
}

Wallet.propTypes = {
  wallet: PropTypes.object
};

export default Wallet;

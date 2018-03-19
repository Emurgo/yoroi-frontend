import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'material-ui/Tabs';
import WalletInfo from '../components/WalletInfo';
import SendAdaForm from '../components/SendAdaForm';
import { toPublicHex } from '../utils/crypto/cryptoUtils';

class Wallet extends Component {
  constructor(props) {
    super(props);
    //TODO: Fetch walletInfo!
  }

  onSendTransaction = (inputs) => {
    // Here we will need to call create transaction endpoint
    alert(`OnSendTransaction ${JSON.stringify(inputs)}`);
  };

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
            <SendAdaForm onSubmit={inputs => this.onSendTransaction(inputs)} />
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

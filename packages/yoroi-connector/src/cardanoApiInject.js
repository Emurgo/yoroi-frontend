(() => {
  class CardanoAuth {
    constructor(auth, rpc) {
      this._auth = auth;
      this._cardano_rpc_call = rpc;
    }
    
    isEnabled() {
      return this._auth != null;
    }
    
    getWalletId() {
      if (!this._auth) {
        throw new Error('This connection does not have auth enabled!');
      }
      return this._auth.walletId;
    }
    
    getWalletPubkey() {
      if (!this._auth) {
        throw new Error('This connection does not have auth enabled!');
      }
      return this._auth.pubkey;
    }
    
    signHexPayload(payload_hex_string) {
      if (!this._auth) {
        throw new Error('This connection does not have auth enabled!');
      }
      return this._cardano_rpc_call("auth_sign_hex_payload/cardano", [payload_hex_string]);
    }
    
    checkHexPayload(payload_hex_string, signature_hex_string) {
      if (!this._auth) {
        throw new Error('This connection does not have auth enabled!');
      }
      return this._cardano_rpc_call("auth_check_hex_payload/cardano", [payload_hex_string, signature_hex_string]);
    }
  }
  class CardanoAPI {
  
    constructor(auth, rpc) {
      const self = this;
      function rpcWrapper(func, params) {
        return rpc(func, params, self._returnType[0]);
      }
      this._auth = new CardanoAuth(auth, rpcWrapper);
      this._cardano_rpc_call = rpcWrapper;
      this._disconnection = [false];
      this._returnType = ["cbor"];
      window.addEventListener('yoroi_wallet_disconnected', function() {
          if (!self._disconnection[0]) {
              self._disconnection[0] = true;
              self._disconnection.slice(1).forEach(f => f());
          }
      });
    }
    
    experimental = Object.freeze({
    
      setReturnType: (returnType) => {
        if (returnType !== 'cbor' && returnType !== 'json') {
          throw new Error('Possible return type values are: "cbor" or "json"');
        }
        this._returnType[0] = returnType;
      },
      
      auth: () => {
        return this._auth;
      },
      
      createTx: (req) => {
        return this._cardano_rpc_call("create_tx/cardano", [req]);
      },

      listNFTs: () => {
        return this._cardano_rpc_call("list_nfts/cardano", []);
      },
      
      onDisconnect: (callback) => {
        if (this._disconnection[0]) {
          throw new Error('Cardano API instance is already disconnected!');
        }
        this._disconnection.push(callback);
      },
      
    }) 
    
    getNetworkId() {
      return this._cardano_rpc_call("get_network_id", []);
    }
    
    getBalance(token_id = '*') {
      return this._cardano_rpc_call("get_balance", [token_id]);
    }
    
    getUsedAddresses(paginate = undefined) {
      return this._cardano_rpc_call("get_used_addresses", [paginate]);
    }
    
    getUnusedAddresses() {
      return this._cardano_rpc_call("get_unused_addresses", []);
    }
    
    getRewardAddresses() {
      return this._cardano_rpc_call("get_reward_addresses/cardano", []);
    }
    
    getChangeAddress() {
      return this._cardano_rpc_call("get_change_address", []);
    }
    
    getUtxos(amount = undefined, paginate = undefined) {
      return this._cardano_rpc_call("get_utxos/cardano", [amount, paginate]);
    }
    
    submitTx(tx) {
      return this._cardano_rpc_call('submit_tx', [tx]);
    }
    
    signTx(param, _partialSign = false) {
      if (param == null) {
        throw new Error('.signTx argument cannot be null!');
      }
      let tx = param;
      let partialSign = _partialSign;
      let returnTx = false;
      if (typeof param === 'object') {
        tx = param.tx;
        partialSign = param.partialSign;
        returnTx = param.returnTx;
      } else if (typeof param !== 'string') {
        throw new Error('.signTx argument is expected to be an object or a string!')
      }
      return this._cardano_rpc_call('sign_tx/cardano', [{ tx, partialSign, returnTx }]);
    }
    
    signData(address, payload) {
      return this._cardano_rpc_call("sign_data", [address, payload]);
    }

    // DEPRECATED
    getCollateralUtxos(requiredAmount) {
      return this._cardano_rpc_call("get_collateral_utxos", [requiredAmount]);
    }

    getCollateral(requiredAmount) {
      return this._cardano_rpc_call("get_collateral_utxos", [requiredAmount]);
    }
  }
  window.CardanoAPI = CardanoAPI;

  window.postMessage({ type: 'scripted_injected' });
})();

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
      function rpcWrapper(func, params) {
        return rpc(func, params, CardanoAPI._returnType[0]);
      }
      CardanoAPI._auth = new CardanoAuth(auth, rpcWrapper);
      CardanoAPI._cardano_rpc_call = rpcWrapper;
      CardanoAPI._disconnection = [false];
      CardanoAPI._returnType = ["cbor"];
      window.addEventListener('yoroi_wallet_disconnected', function() {
          if (!CardanoAPI._disconnection[0]) {
            CardanoAPI._disconnection[0] = true;
            CardanoAPI._disconnection.slice(1).forEach(f => f());
          }
      });
    }

    cip95 = Object.freeze({
    
        getPubDRepKey: () => {
            return CardanoAPI._cardano_rpc_call("get_drep_key", []);
        },
    
        getRegisteredPubStakeKeys: () => {
            return CardanoAPI._cardano_rpc_call("get_stake_key", [])
                .then(({ key, isRegistered }) => isRegistered ? [key] : []);
        },
    
        getUnregisteredPubStakeKeys: () => {
            return CardanoAPI._cardano_rpc_call("get_stake_key", [])
                .then(({ key, isRegistered }) => isRegistered ? [] : [key]);
        },
    
        signData(address, payload) {
          return CardanoAPI._cardano_rpc_call("cip95_sign_data", [address, payload]);
        },

    })

    experimental = Object.freeze({
    
      setReturnType: (returnType) => {
        if (returnType !== 'cbor' && returnType !== 'json') {
          throw new Error('Possible return type values are: "cbor" or "json"');
        }
        CardanoAPI._returnType[0] = returnType;
      },
      
      auth: () => {
        // <TODO:PENDING_REMOVAL> experimental
        console.warn(`
          WARNING!! YOROI-EXPERIMENTAL function "auth" is about to be removed.
          Migrate to some other API for authentication immediately.
        `);
        return CardanoAPI._auth;
      },
      
      createTx: (req) => {
        // <TODO:PENDING_REMOVAL> experimental
        console.warn(`
          WARNING!! YOROI-EXPERIMENTAL function "createTx" is about to be removed.
          Migrate to some other API for transaction building immediately.
        `);
        return CardanoAPI._cardano_rpc_call("create_tx/cardano", [req]);
      },

      listNFTs: () => {
        return CardanoAPI._cardano_rpc_call("list_nfts/cardano", []);
      },
      
      onDisconnect: (callback) => {
        if (CardanoAPI._disconnection[0]) {
          throw new Error('Cardano API instance is already disconnected!');
        }
        CardanoAPI._disconnection.push(callback);
      },
      
    }) 

    getExtensions() {
      return Promise.resolve([{ cip: 95 }]);
    }

    getNetworkId() {
      return CardanoAPI._cardano_rpc_call("get_network_id", []);
    }
    
    getBalance(token_id = '*') {
      return CardanoAPI._cardano_rpc_call("get_balance", [token_id]);
    }
    
    getUsedAddresses(paginate = undefined) {
      return CardanoAPI._cardano_rpc_call("get_used_addresses", [paginate]);
    }
    
    getUnusedAddresses() {
      return CardanoAPI._cardano_rpc_call("get_unused_addresses", []);
    }
    
    getRewardAddresses() {
      return CardanoAPI._cardano_rpc_call("get_reward_addresses/cardano", []);
    }
    
    getChangeAddress() {
      return CardanoAPI._cardano_rpc_call("get_change_address", []);
    }
    
    getUtxos(amount = undefined, paginate = undefined) {
      return CardanoAPI._cardano_rpc_call("get_utxos/cardano", [amount, paginate]);
    }
    
    submitTx(tx) {
      return CardanoAPI._cardano_rpc_call('submit_tx', [tx]);
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
      return CardanoAPI._cardano_rpc_call('sign_tx/cardano', [{ tx, partialSign, returnTx }]);
    }
    
    signData(address, payload) {
      return CardanoAPI._cardano_rpc_call("sign_data", [address, payload]);
    }

    // DEPRECATED
    getCollateralUtxos(requiredAmount) {
      const amount = typeof requiredAmount === 'object' ? requiredAmount.amount : requiredAmount;
      const strAmount = amount == null || amount === '' ? null : String(amount);
      return CardanoAPI._cardano_rpc_call("get_collateral_utxos", [strAmount]);
    }

    getCollateral(requiredAmount) {
      const amount = typeof requiredAmount === 'object' ? requiredAmount.amount : requiredAmount;
      const strAmount = amount == null || amount === '' ? null : String(amount);
      return CardanoAPI._cardano_rpc_call("get_collateral_utxos", [strAmount]);
    }
  }
  window.CardanoAPI = CardanoAPI;

  window.postMessage({ type: 'scripted_injected' });
})();

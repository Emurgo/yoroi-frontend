// RPC set-up
(() => {
var ergoRpcUid = 0;
var ergoRpcResolver = new Map();

window.addEventListener("message", function(event) {
    if (event.data.type == "connector_rpc_response" && event.data.protocol === "ergo") {
        console.debug("page received from connector: " + JSON.stringify(event.data) + " with source = " + event.source + " and origin = " + event.origin);
        const rpcPromise = ergoRpcResolver.get(event.data.uid);
        if (rpcPromise !== undefined) {
            const ret = event.data.return;
            if (ret.err !== undefined) {
                rpcPromise.reject(ret.err);
            } else {
                rpcPromise.resolve(ret.ok);
            }
        }
    }
});

class ErgoAPI {
    get_balance(token_id = 'ERG') {
        return this._ergo_rpc_call("get_balance", [token_id]);
    }

    get_utxos(amount = undefined, token_id = 'ERG', paginate = undefined) {
        return this._ergo_rpc_call("get_utxos", [amount, token_id, paginate]);
    }

    get_used_addresses(paginate = undefined) {
        return this._ergo_rpc_call("get_used_addresses", [paginate]);
    }

    get_unused_addresses() {
        return this._ergo_rpc_call("get_unused_addresses", []);
    }

    get_change_address() {
        return this._ergo_rpc_call("get_change_address", []);
    }

    sign_tx(tx) {
        return this._ergo_rpc_call("sign_tx", [tx]);
    }

    sign_tx_input(tx, index) {
        return this._ergo_rpc_call("sign_tx_input", [tx, index]);
    }

    // This is unsupported by current version of Yoroi
    // and the details of it are not finalized yet in the EIP-012
    // dApp bridge spec.
    // sign_data(addr, message) {
    //     return this._ergo_rpc_call("sign_data", [addr, message]);
    // }

    submit_tx(tx) {
        return this._ergo_rpc_call("submit_tx", [tx]);
    }

    _ergo_rpc_call(func, params) {
        return new Promise(function(resolve, reject) {
            window.postMessage({
                type: "connector_rpc_request",
                protocol: "ergo",
                uid: ergoRpcUid,
                function: func,
                params: params
            }, location.origin);
            console.debug("ergoRpcUid = " + ergoRpcUid);
            ergoRpcResolver.set(ergoRpcUid, { resolve: resolve, reject: reject });
            ergoRpcUid += 1;
        });
    }
}

window.ergo = Object.freeze(new ErgoAPI());
window.postMessage({ type: 'scripted_injected' });
})();

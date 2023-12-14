// mock backend script runs the same babel for compiling the server as for compiling the website
// this is problematic because we need the nodejs version of the WASM bindings for the server
// we hack it by just loading the nodejs versions here and swapping it into the variables
const { RustModule } = require('../app/api/ada/lib/cardanoCrypto/rustLoader');
const wasmv2 = require('cardano-wallet');
const wasmv3 = require('@emurgo/js-chain-libs-node/js_chain_libs');
const wasmv4 = require('@emurgo/cardano-serialization-lib-nodejs/cardano_serialization_lib');

RustModule._wasmv2 = wasmv2;
// $FlowExpectedError[incompatible-type] nodejs & browser API have same interface so it's okay
RustModule._wasmv3 = wasmv3;
// $FlowExpectedError[incompatible-type] nodejs & browser API have same interface so it's okay
RustModule._wasmv4 = wasmv4;

/*
const { getMockServer } = require('../features/mock-chain/mockErgoServer');
const { resetChain } = require('../features/mock-chain/mockErgoImporter');

getMockServer({ outputLog: true });
resetChain();
*/

const { getMockServer } = require('../features/mock-chain/mockCardanoServer');
const { resetChain, MockChain } = require('../features/mock-chain/mockCardanoImporter');

getMockServer({ outputLog: true });
resetChain(MockChain.Standard);


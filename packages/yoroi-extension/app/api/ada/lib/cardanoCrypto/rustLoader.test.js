// @flow
import '../test-config.forTests';
import { RustModule } from './rustLoader';
import { bytesToHex } from '../../../../coreUtils';

beforeAll(async () => {
  await RustModule.load();
});

test('Wasm Scope Simple Address Convert', async () => {

  const addr = 'addr1qf2w3pe8jsyvr9kutpv6e0rzuaym7dvq0rrz9699a7y3wwvz6g3gz764vxla692p4ttcekdw0smpedxuqq7a8t8sv3usrcv98z';
  const addressFixedDirectly = bytesToHex(RustModule.WalletV4.Address.from_bech32(addr).to_bytes());
  const scopeResult = RustModule.__WasmScopeInternal(Module => {
    return bytesToHex(Module.WalletV4.Address.from_bech32(addr).to_bytes());
  });
  const addressFixedInScope = scopeResult.result;
  expect(addressFixedInScope).toEqual(addressFixedDirectly);
  expect(scopeResult.scopeSize).toEqual(1);
  expect(scopeResult.scopeIsFree).toEqual(true);
});

test('Wasm Scope Monad Simple Address Convert', async () => {

  const addr = 'addr1qf2w3pe8jsyvr9kutpv6e0rzuaym7dvq0rrz9699a7y3wwvz6g3gz764vxla692p4ttcekdw0smpedxuqq7a8t8sv3usrcv98z';
  const addressFixedDirectly = bytesToHex(RustModule.WalletV4.Address.from_bech32(addr).to_bytes());
  const addressFixedInScope = RustModule
    .ScopeMonad(Module => Module.WalletV4.Address.from_bech32(addr))
    .wasmMap(a => a.to_bytes())
    .unwrap(bytes => bytesToHex(bytes));
  expect(addressFixedInScope).toEqual(addressFixedDirectly);
});

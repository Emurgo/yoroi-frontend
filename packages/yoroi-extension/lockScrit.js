// @flow

const { mnemonicToEntropy } = require('bip39');
const slib = require('@emurgo/cardano-serialization-lib-nodejs');

const entropy = mnemonicToEntropy(
  'make exercise taxi asset reject seek brain volcano roof boss already cement scrub nut priority'
);

const rootKey = slib.Bip32PrivateKey.from_bip39_entropy(
  Buffer.from(entropy, 'hex'),
  Buffer.from('')
);

// keys
const accountKey = rootKey
  .derive(1852) // purpose
  .derive(1815) // coin type
  .derive(0); // account #0

const lockingPubKey = accountKey
  .derive(5) // external
  .derive(4) // voting round no
  .to_public();

const stakePubKey = accountKey
  .derive(2) // staking
  .derive(0)
  .to_public();

const votingLockStart = 113616000; // absolute slot as per the datetime of locking start
const votingLockEnds = 113706000; // absolute slot as per the datetime of locking end

const stakingCred = slib.StakeCredential.from_keyhash(stakePubKey.to_raw_key().hash());

const beforeSlotScript = slib.NativeScript.new_timelock_start(
  slib.TimelockStart.new(votingLockStart)
);

const afterSlotScript = slib.NativeScript.new_timelock_expiry(
  slib.TimelockExpiry.new(votingLockEnds)
);

const pubKeyScript = slib.NativeScript.new_script_pubkey(
  slib.ScriptPubkey.new(lockingPubKey.to_raw_key().hash())
);

const scripts = slib.NativeScripts.new();
scripts.add(beforeSlotScript);
scripts.add(afterSlotScript);
scripts.add(pubKeyScript);

const timeLockScript = slib.NativeScript.new_script_all(slib.ScriptAll.new(scripts));

const scriptHash = slib.ScriptHash.from_bytes(timeLockScript.hash().to_bytes());

const scriptKey = slib.StakeCredential.from_scripthash(scriptHash);
const baseAddress = slib.BaseAddress.new(
  slib.NetworkInfo.mainnet().network_id(),
  scriptKey,
  stakingCred
);

const addr = baseAddress.to_address().to_bech32(); // funds to be sent here to be locked, funds will staked as per wallet selection

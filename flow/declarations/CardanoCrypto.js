declare module 'rust-cardano-crypto' {
  declare module.exports: {
    Blake2b: {
      blake2b_256(entropy: string): Uint8Array;
    },
    HdWallet: {
      fromSeed(seed: Uint8Array): Uint8Array,
      toPublic(xprv: Uint8Array): Uint8Array,
      derivePrivate(
        xprv: Uint8Array,
        index: Array<number>
      ): Uint8Array,
      derivePublic(
        xprv: Uint8Array,
        index: Array<number>
      ): Uint8Array,
      sign(
        xprv: Uint8Array,
        msg: any // TODO: Complete with specific type
      ): any, // TODO: Complete with specific type
      publicKeyToAddress(
        xpub: Uint8Array,
        payload: CryptoAddressPayload
      ): CryptoAddress,
      addressGetPayload(
        address: CryptoAddress
      ): CryptoAddressPayload
    },
    RandomAddressChecker: {
      newChecker(
        xprv: string
      ): {
        result: CryptoAddressChecker,
        failed: boolean,
        msg: ?string
      },
      checkAddresses(
        checker: CryptoAddressChecker,
        addresses: Array<string>
      ): {
        result: Array<string>,
        failed: boolean,
        msg: ?string
      }
    },
    Wallet: {
      fromSeed(seed: Array<mixed>): {
        result: CryptoWallet,
        failed: boolean,
        msg: ?string
      },
      checkAddress(address: string): {
        result: boolean,
        failed: boolean,
        msg: ?string
      },
      newAccount(w: CryptoWallet, accountIndex: number): {
        result: {
          Ok: CryptoAccount
        },
        failed: boolean,
        msg: ?string
      },
      generateAddresses(
        a: CryptoAccount,
        t: AddressType,
        addressIndexes: Array<number>
      ): {
        result: Array<string>,
        failed: boolean,
        msg: ?string
      },
      spend(
        w: CryptoWallet,
        inputs: Array<TxInput>,
        outputs: Array<TxOutput>,
        changeAddr: string
      ): {
        result: {
          cbor_encoded_tx: Array<number>,
          fee: number,
          tx: CryptoTransaction
        },
        failed: boolean,
        msg: ?string
      }
    }
  }
}

declare type CryptoWallet = {
  cached_root_key: string,
  config: CryptoConfig,
  selection_policy: SelectionPolicy
}

declare type CryptoAccount = {
  account: number,
  cached_account_key: string
}

declare type CryptoTransaction = {
  tx: {
    tx: {
      inputs: Array<TxInputPtr>,
      outputs: Array<TxOutput>
    },
    witnesses: Array<TxWitness>
  }
}

declare type CryptoAddress = any // TODO: Complete with specific type
declare type CryptoAddressPayload = any // TODO: Complete with specific type

declare type CryptoAddressChecker = {
  root_key: string,
  payload_key: Array<number>
}


declare type TxInput = {
  ptr: TxInputPtr,
  value: TxOutput,
  addressing: {
    account: number,
    change: number,
    index: number
  }
}

declare type TxOutput = {
  address: string,
  value: number
}

declare type AddressType = "External" | "Internal";

declare type TxInputPtr = {
  id: string,
  index: number
}

declare type TxWitness = {
  PkWitness: Array<string>
}

declare type CryptoConfig = {
  protocol_magic: number
};

declare type SelectionPolicy = 'FirstMatchFirst';

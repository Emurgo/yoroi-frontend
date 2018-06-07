declare module 'rust-cardano-crypto' {
  declare module.exports: {
    Blake2b: {
      blake2b_256(entropy: string): Uint8Array;
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

import PasswordProtect from "../../js-cardano-wasm/js/PasswordProtect";

declare module 'rust-cardano-crypto' {
  declare module.exports: {
    loadRustModule(): Promise<void>,
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
      ): CryptoAddressPayload,
      fromEnhancedEntropy(
        entropy: Uint8Array,
        password: string
      ): any // TODO: Complete with specific type
    },
    RandomAddressChecker: {
      newChecker(
        xprv: string
      ): {
        result: CryptoAddressChecker,
        failed: boolean,
        msg: ?string
      },
      newCheckerFromMnemonics(
        secretWords: string
      ): {
        result: CryptoAddressChecker,
        failed: boolean,
        msg: ?string
      },
      checkAddresses(
        checker: CryptoAddressChecker,
        addresses: Array<string>
      ): {
        result: Array<CryptoDaedalusAddressRestored>,
        failed: boolean,
        msg: ?string
      }
    },
    Wallet: {
      fromMasterKey(masterKey: Uint8Array): {
        result: CryptoWallet,
        failed: boolean,
        msg: ?string
      },
      fromSeed(seed: Array<mixed>): {
        result: CryptoWallet,
        failed: boolean,
        msg: ?string
      },
      fromDaedalusMnemonic(mnemonis: string): {
        result: CryptoDaedalusWallet,
        failed: boolean,
        msg: ?string
      },
      checkAddress(address: string): {
        result: boolean,
        failed: boolean,
        msg: ?string
      },
      newAccount(w: CryptoWallet, accountIndex: number): {
        result: CryptoAccount,
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
        result: SpendResponse,
        failed: boolean,
        msg: ?string
      },
      move(
        w: CryptoDaedalusWallet,
        inputs: Array<TxDaedalusInput>,
        output: string
      ): {
        result: MoveResponse,
        failed: boolean,
        msg: ?string
      }
    },
    PasswordProtect: {
      encryptWithPassword(
        password: Uint8Array,
        salt: Uint8Array,
        nonce: Uint8Array,
        data: Uint8Array
      ): ?Uint8Array | false,
      decryptWithPassword(
        password: Uint8Array,
        data: Uint8Array
      ): ?Uint8Array | false
    }
  }
}


declare type SpendResponse = {
  cbor_encoded_tx: Array<number>,
  changed_used: boolean,
  fee: number
}

declare type MoveResponse = {
  cbor_encoded_tx: Array<number>,
  fee: number,
  tx: CryptoTransaction
}

declare type CryptoWallet = {
  root_key: string,
  root_cached_key: string,
  config: CryptoConfig,
  selection_policy: SelectionPolicy,
  derivation_scheme: string
}

declare type CryptoDaedalusWallet = {
  root_key: string,
  root_cached_key: string,
  config: CryptoConfig,
  selection_policy: SelectionPolicy,
  derivation_scheme: DerivationScheme
}

declare type CryptoAccount = {
  account: number,
  root_cached_key: string,
  derivation_scheme: string
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

declare type CryptoDaedalusAddressRestored = {
  address: string,
  addressing: Array<number>
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

declare type TxDaedalusInput = {
  ptr: TxInputPtr,
  value: string,
  addressing: Array<number>
}

declare type TxOutput = {
  address: string,
  value: string
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

declare type DerivationScheme = 'V1' | 'V2';

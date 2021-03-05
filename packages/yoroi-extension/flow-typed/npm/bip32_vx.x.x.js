// @flow

declare module "bip32" {
  declare interface Network {
      wif: number;
      bip32: {|
        public: number;
        private: number;
      |};
      messagePrefix?: string;
      bech32?: string;
      pubKeyHash?: number;
      scriptHash?: number;
  }
  declare interface BIP32Interface {
      chainCode: Buffer;
      network: Network;
      lowR: boolean;
      depth: number;
      index: number;
      parentFingerprint: number;
      publicKey: Buffer;
      privateKey?: Buffer;
      identifier: Buffer;
      fingerprint: Buffer;
      isNeutered(): boolean;
      neutered(): BIP32Interface;
      toBase58(): string;
      toWIF(): string;
      derive(index: number): BIP32Interface;
      deriveHardened(index: number): BIP32Interface;
      derivePath(path: string): BIP32Interface;
      sign(hash: Buffer, lowR?: boolean): Buffer;
      verify(hash: Buffer, signature: Buffer): boolean;
  }
  declare function fromBase58(inString: string, network?: Network): BIP32Interface;
  declare function fromPrivateKey(privateKey: Buffer, chainCode: Buffer, network?: Network): BIP32Interface;
  declare function fromPublicKey(publicKey: Buffer, chainCode: Buffer, network?: Network): BIP32Interface;
  declare function fromSeed(seed: Buffer, network?: Network): BIP32Interface;
}

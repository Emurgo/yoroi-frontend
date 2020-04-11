// @flow
declare module 'bip39' {
  declare export function mnemonicToSeedSync(
    mnemonic: string,
    password?: string
  ): Buffer;
  declare export function mnemonicToSeed(
    mnemonic: string,
    password?: string
  ): Promise<Buffer>;
  declare export function mnemonicToEntropy(
    mnemonic: string,
    wordlist?: string[]
  ): string;
  declare export function entropyToMnemonic(
    entropy: Buffer | string,
    wordlist?: string[]
  ): string;
  declare export function generateMnemonic(
    strength?: number,
    rng?: (size: number) => Buffer,
    wordlist?: string[]
  ): string;
  declare export function validateMnemonic(
    mnemonic: string, wordlist?: string[]
  ): boolean;
  declare export function setDefaultWordlist(
    language: string
  ): void;
  declare export function getDefaultWordlist(): string;

  declare export var wordlists: { [index: string]: string[], ... };
  declare export var _default: string[] | void;

}

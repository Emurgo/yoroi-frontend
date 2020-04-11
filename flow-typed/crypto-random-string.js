// @flow

interface BaseOptions {
  /**
  Length of the returned string.
  */
  length: number;
}

interface TypeOption {
  /**
  Use only characters from a predefined set of allowed characters.

  Cannot be set at the same time as the `characters` option.

  @default 'hex'

  @example
  ```
  cryptoRandomString({length: 10});
  //=> '87fc70e2b9'

  cryptoRandomString({length: 10, type:'base64'});
  //=> 'mhsX7xmIv/'

  cryptoRandomString({length: 10, type:'url-safe'});
  //=> 'VEjfNW3Yej'
  ```
  */
  type?: 'hex' | 'base64' | 'url-safe';
}

interface CharactersOption {
  /**
  Use only characters from a custom set of allowed characters.

  Cannot be set at the same time as the `type` option.

  Minimum length: `1`
  Maximum length: `65536`

  @example
  ```
  cryptoRandomString({length: 10, characters:'0123456789'});
  //=> '8796225811'
  ```
  */
  characters?: string;
}

type Options = BaseOptions & (TypeOption | CharactersOption);

declare function cryptoRandomString(options?: Options): string;

declare module 'crypto-random-string' {
  declare module.exports: typeof cryptoRandomString;
}

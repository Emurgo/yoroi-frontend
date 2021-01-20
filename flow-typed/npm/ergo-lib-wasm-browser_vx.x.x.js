// @flow

/* eslint-disable camelcase */

type ErgoBoxJson = {|
  boxId: string,
  value: number,
  ergoTree: string,
  assets: Array<{|
    tokenId: string, // hex
    amount: number,
  |}>,
  creationHeight: number,
  additionalRegisters: {| [key: string]: string /* hex */ |},
  transactionId: string,
  index: number
|};

/**
 * Generated by Flowgen from a Typescript Definition
 * Repo: http://github.com/joarwilk/flowgen
 */
declare module 'ergo-lib-wasm-browser' { // need to wrap flowgen output into module
  /**
  * newtype for box registers R4 - R9
  */

  declare export var NonMandatoryRegisterId: {|
    +R4: 4,
    +R5: 5,
    +R6: 6,
    +R7: 7,
    +R8: 8,
    +R9: 9,
  |};

  /**
  * Network type
  */

  declare export var NetworkPrefix: {|
    +Mainnet: 0,
    +Testnet: 16,
  |};

  /**
  * Address types
  */

  declare export var AddressTypePrefix: {|
    +P2PK: 1,
    +Pay2SH: 2,
    +Pay2S: 3,
  |};

  /**
  * * An address is a short string corresponding to some script used to protect a box. Unlike (string-encoded) binary
  * * representation of a script, an address has some useful characteristics:
  * *
  * * - Integrity of an address could be checked., as it is incorporating a checksum.
  * * - A prefix of address is showing network and an address type.
  * * - An address is using an encoding (namely, Base58) which is avoiding similarly l0Oking characters, friendly to
  * * double-clicking and line-breaking in emails.
  * *
  * *
  * *
  * * An address is encoding network type, address type, checksum, and enough information to watch for a particular scripts.
  * *
  * * Possible network types are:
  * * Mainnet - 0x00
  * * Testnet - 0x10
  * *
  * * For an address type, we form content bytes as follows:
  * *
  * * P2PK - serialized (compressed) public key
  * * P2SH - first 192 bits of the Blake2b256 hash of serialized script bytes
  * * P2S  - serialized script
  * *
  * * Address examples for testnet:
  * *
  * * 3   - P2PK (3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN)
  * * ?   - P2SH (rbcrmKEYduUvADj9Ts3dSVSG27h54pgrq5fPuwB)
  * * ?   - P2S (Ms7smJwLGbUAjuWQ)
  * *
  * * for mainnet:
  * *
  * * 9  - P2PK (9fRAWhdxEsTcdb8PhGNrZfwqa65zfkuYHAMmkQLcic1gdLSV5vA)
  * * ?  - P2SH (8UApt8czfFVuTgQmMwtsRBZ4nfWquNiSwCWUjMg)
  * * ?  - P2S (4MQyML64GnzMxZgm, BxKBaHkvrTvLZrDcZjcsxsF7aSsrN73ijeFZXtbj4CXZHHcvBtqSxQ)
  * *
  * *
  * * Prefix byte = network type + address type
  * *
  * * checksum = blake2b256(prefix byte ++ content bytes)
  * *
  * * address = prefix byte ++ content bytes ++ checksum
  * *
  */
  declare export class Address {
    free(): void;

    /**
    * Re-create the address from ErgoTree that was built from the address
    *
    * At some point in the past a user entered an address from which the ErgoTree was built.
    * Re-create the address from this ErgoTree.
    * `tree` - ErgoTree that was created from an Address
    * @param {ErgoTree} ergo_tree
    * @returns {Address}
    */
    static recreate_from_ergo_tree(ergo_tree: ErgoTree): Address;

    /**
    * Create a P2PK address from serialized PK bytes(EcPoint/GroupElement)
    * @param {Uint8Array} bytes
    * @returns {Address}
    */
    static p2pk_from_pk_bytes(bytes: Uint8Array): Address;

    /**
    * Decode (base58) testnet address from string, checking that address is from the testnet
    * @param {string} s
    * @returns {Address}
    */
    static from_testnet_str(s: string): Address;

    /**
    * Decode (base58) mainnet address from string, checking that address is from the mainnet
    * @param {string} s
    * @returns {Address}
    */
    static from_mainnet_str(s: string): Address;

    /**
    * Decode (base58) address from string without checking the network prefix
    * @param {string} s
    * @returns {Address}
    */
    static from_base58(s: string): Address;

    /**
    * Encode (base58) address
    * @param {number} network_prefix
    * @returns {string}
    */
    to_base58(network_prefix: number): string;

    /**
    * Decode from a serialized address (that includes the network prefix)
    * @param {Uint8Array} data
    * @returns {Address}
    */
    static from_bytes(data: Uint8Array): Address;

    /**
    * Encode address as serialized bytes (that includes the network prefix)
    * @param {number} network_prefix
    * @returns {Uint8Array}
    */
    to_bytes(network_prefix: number): Uint8Array;

    /**
    * Get the type of the address
    * @returns {$Values<typeof AddressTypePrefix>}
    */
    address_type_prefix(): $Values<typeof AddressTypePrefix>;

    /**
    * Create an address from a public key
    * @param {Uint8Array} bytes
    * @returns {Address}
    */
    static from_public_key(bytes: Uint8Array): Address;

    /**
    * Creates an ErgoTree script from the address
    * @returns {ErgoTree}
    */
    to_ergo_tree(): ErgoTree;
  }
  /**
  * Box id (32-byte digest)
  */
  declare export class BoxId {
    free(): void;

    /**
    * Base16 encoded string
    * @returns {string}
    */
    to_str(): string;
  }
  /**
  * Selected boxes with change boxes (by [`BoxSelector`])
  */
  declare export class BoxSelection {
    free(): void;

    /**
    * Create a selection to easily inject custom selection algorithms
    * @param {ErgoBoxes} boxes
    * @param {ErgoBoxAssetsDataList} change
    */
    constructor(boxes: ErgoBoxes, change: ErgoBoxAssetsDataList): this;

    /**
    * Selected boxes to spend as transaction inputs
    * @returns {ErgoBoxes}
    */
    boxes(): ErgoBoxes;

    /**
    * Selected boxes to use as change
    * @returns {ErgoBoxAssetsDataList}
    */
    change(): ErgoBoxAssetsDataList;
  }
  /**
  * Box value in nanoERGs with bound checks
  */
  declare export class BoxValue {
    free(): void;

    /**
    * Recommended (safe) minimal box value to use in case box size estimation is unavailable.
    * Allows box size upto 2777 bytes with current min box value per byte of 360 nanoERGs
    * @returns {BoxValue}
    */
    static SAFE_USER_MIN(): BoxValue;

    /**
    * Number of units inside one ERGO (i.e. one ERG using nano ERG representation)
    * @returns {I64}
    */
    static UNITS_PER_ERGO(): I64;

    /**
    * Create from i64 with bounds check
    * @param {I64} v
    * @returns {BoxValue}
    */
    static from_i64(v: I64): BoxValue;

    /**
    * Get value as signed 64-bit long (I64)
    * @returns {I64}
    */
    as_i64(): I64;
  }
  /**
  * Ergo constant(evaluated) values
  */
  declare export class Constant {
    free(): void;

    /**
    * Decode from Base16-encoded ErgoTree serialized value
    * @param {string} base16_bytes_str
    * @returns {Constant}
    */
    static decode_from_base16(base16_bytes_str: string): Constant;

    /**
    * Encode as Base16-encoded ErgoTree serialized value
    * @returns {string}
    */
    encode_to_base16(): string;

    /**
    * Create from i32 value
    * @param {number} v
    * @returns {Constant}
    */
    static from_i32(v: number): Constant;

    /**
    * Extract i32 value, returning error if wrong type
    * @returns {number}
    */
    to_i32(): number;

    /**
    * Create from i64
    * @param {I64} v
    * @returns {Constant}
    */
    static from_i64(v: I64): Constant;

    /**
    * Extract i64 value, returning error if wrong type
    * @returns {I64}
    */
    to_i64(): I64;

    /**
    * Create from byte array
    * @param {Uint8Array} v
    * @returns {Constant}
    */
    static from_byte_array(v: Uint8Array): Constant;

    /**
    * Extract byte array, returning error if wrong type
    * @returns {Uint8Array}
    */
    to_byte_array(): Uint8Array;
  }
  /**
  * Proof of correctness of tx spending
  */
  declare export class ContextExtension {
    free(): void;

    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len(): number;

    /**
    * get from map or fail if key is missing
    * @param {number} key
    * @returns {Constant}
    */
    get(key: number): Constant;

    /**
    * Returns all keys in the map
    * @returns {Uint8Array}
    */
    keys(): Uint8Array;
  }
  /**
  * Defines the contract(script) that will be guarding box contents
  */
  declare export class Contract {
    free(): void;

    /**
    * create new contract that allow spending of the guarded box by a given recipient ([`Address`])
    * @param {Address} recipient
    * @returns {Contract}
    */
    static pay_to_address(recipient: Address): Contract;
  }
  /**
  * Inputs, that are used to enrich script context, but won't be spent by the transaction
  */
  declare export class DataInput {
    free(): void;

    /**
    * Get box id
    * @returns {BoxId}
    */
    box_id(): BoxId;
  }
  /**
  * DataInput collection
  */
  declare export class DataInputs {
    free(): void;

    /**
    * Create empty DataInputs
    */
    constructor(): this;

    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len(): number;

    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {DataInput}
    */
    get(index: number): DataInput;

    /**
    * Adds an elements to the collection
    * @param {DataInput} elem
    */
    add(elem: DataInput): void;
  }
  /**
  * Ergo box, that is taking part in some transaction on the chain
  * Differs with [`ErgoBoxCandidate`] by added transaction id and an index in the input of that transaction
  */
  declare export class ErgoBox {
    free(): void;

    /**
    * make a new box with:
    * `value` - amount of money associated with the box
    * `contract` - guarding contract([`Contract`]), which should be evaluated to true in order
    * to open(spend) this box
    * `creation_height` - height when a transaction containing the box is created.
    * `tx_id` - transaction id in which this box was "created" (participated in outputs)
    * `index` - index (in outputs) in the transaction
    * @param {BoxValue} value
    * @param {number} creation_height
    * @param {Contract} contract
    * @param {TxId} tx_id
    * @param {number} index
    * @param {Tokens} tokens
    */
    constructor(
      value: BoxValue,
      creation_height: number,
      contract: Contract,
      tx_id: TxId,
      index: number,
      tokens: Tokens
    ): this;

    /**
    * Get box id
    * @returns {BoxId}
    */
    box_id(): BoxId;

    /**
    * Get box creation height
    * @returns {number}
    */
    creation_height(): number;

    /**
    * Get tokens for box
    * @returns {Tokens}
    */
    tokens(): Tokens;

    /**
    * Get ergo tree for box
    * @returns {ErgoTree}
    */
    ergo_tree(): ErgoTree;

    /**
    * Get box value in nanoERGs
    * @returns {BoxValue}
    */
    value(): BoxValue;

    /**
    * Returns value (ErgoTree constant) stored in the register or None if the register is empty
    * @param {number} register_id
    * @returns {Constant | void}
    */
    register_value(register_id: number): Constant | void;

    /**
    * JSON representation
    * @returns {ErgoBoxJson}
    */
    to_json(): ErgoBoxJson;

    /**
    * JSON representation
    * @param {string} box
    * @returns {ErgoBox}
    */
    static from_json(box: string): ErgoBox;
  }
  /**
  * Pair of <value, tokens> for an box
  */
  declare export class ErgoBoxAssetsData {
    free(): void;

    /**
    * Create empty SimpleBoxSelector
    * @param {BoxValue} value
    * @param {Tokens} tokens
    */
    constructor(value: BoxValue, tokens: Tokens): this;

    /**
    * Value part of the box
    * @returns {BoxValue}
    */
    value(): BoxValue;

    /**
    * Tokens part of the box
    * @returns {Tokens}
    */
    tokens(): Tokens;
  }
  /**
  * List of asset data for a box
  */
  declare export class ErgoBoxAssetsDataList {
    free(): void;

    /**
    * Create empty Tokens
    */
    constructor(): this;

    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len(): number;

    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {ErgoBoxAssetsData}
    */
    get(index: number): ErgoBoxAssetsData;

    /**
    * Adds an elements to the collection
    * @param {ErgoBoxAssetsData} elem
    */
    add(elem: ErgoBoxAssetsData): void;
  }
  /**
  * ErgoBox candidate not yet included in any transaction on the chain
  */
  declare export class ErgoBoxCandidate {
    free(): void;

    /**
    * Returns value (ErgoTree constant) stored in the register or None if the register is empty
    * @param {number} register_id
    * @returns {Constant | void}
    */
    register_value(register_id: number): Constant | void;

    /**
    * Get box creation height
    * @returns {number}
    */
    creation_height(): number;

    /**
    * Get tokens for box
    * @returns {Tokens}
    */
    tokens(): Tokens;

    /**
    * Get ergo tree for box
    * @returns {ErgoTree}
    */
    ergo_tree(): ErgoTree;

    /**
    * Get box value in nanoERGs
    * @returns {BoxValue}
    */
    value(): BoxValue;
  }
  /**
  * ErgoBoxCandidate builder
  */
  declare export class ErgoBoxCandidateBuilder {
    free(): void;

    /**
    * Create builder with required box parameters:
    * `value` - amount of money associated with the box
    * `contract` - guarding contract([`Contract`]), which should be evaluated to true in order
    * to open(spend) this box
    * `creation_height` - height when a transaction containing the box is created.
    * It should not exceed height of the block, containing the transaction with this box.
    * @param {BoxValue} value
    * @param {Contract} contract
    * @param {number} creation_height
    */
    constructor(
      value: BoxValue,
      contract: Contract,
      creation_height: number
    ): this;

    /**
    * Set minimal value (per byte of the serialized box size)
    * @param {number} new_min_value_per_byte
    */
    set_min_box_value_per_byte(new_min_value_per_byte: number): void;

    /**
    * Get minimal value (per byte of the serialized box size)
    * @returns {number}
    */
    min_box_value_per_byte(): number;

    /**
    * Set new box value
    * @param {BoxValue} new_value
    */
    set_value(new_value: BoxValue): void;

    /**
    * Get box value
    * @returns {BoxValue}
    */
    value(): BoxValue;

    /**
    * Calculate serialized box size(in bytes)
    * @returns {number}
    */
    calc_box_size_bytes(): number;

    /**
    * Calculate minimal box value for the current box serialized size(in bytes)
    * @returns {BoxValue}
    */
    calc_min_box_value(): BoxValue;

    /**
    * Set register with a given id (R4-R9) to the given value
    * @param {number} register_id
    * @param {Constant} value
    */
    set_register_value(register_id: number, value: Constant): void;

    /**
    * Returns register value for the given register id (R4-R9), or None if the register is empty
    * @param {number} register_id
    * @returns {Constant | void}
    */
    register_value(register_id: number): Constant | void;

    /**
    * Delete register value(make register empty) for the given register id (R4-R9)
    * @param {number} register_id
    */
    delete_register_value(register_id: number): void;

    /**
    * Mint token, as defined in https://github.com/ergoplatform/eips/blob/master/eip-0004.md
    * `token` - token id(box id of the first input box in transaction) and token amount,
    * `token_name` - token name (will be encoded in R4),
    * `token_desc` - token description (will be encoded in R5),
    * `num_decimals` - number of decimals (will be encoded in R6)
    * @param {Token} token
    * @param {string} token_name
    * @param {string} token_desc
    * @param {number} num_decimals
    */
    mint_token(
      token: Token,
      token_name: string,
      token_desc: string,
      num_decimals: number
    ): void;

    /**
    * Add given token id and token amount
    * @param {TokenId} token_id
    * @param {TokenAmount} amount
    */
    add_token(token_id: TokenId, amount: TokenAmount): void;

    /**
    * Build the box candidate
    * @returns {ErgoBoxCandidate}
    */
    build(): ErgoBoxCandidate;
  }
  /**
  * Collection of ErgoBoxCandidates
  */
  declare export class ErgoBoxCandidates {
    free(): void;

    /**
    * Create new outputs
    * @param {ErgoBoxCandidate} box_candidate
    */
    constructor(box_candidate: ErgoBoxCandidate): this;

    /**
    * sometimes it's useful to keep track of an empty list
    * but keep in mind Ergo transactions need at least 1 output
    * @returns {ErgoBoxCandidates}
    */
    static empty(): ErgoBoxCandidates;

    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len(): number;

    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {ErgoBoxCandidate}
    */
    get(index: number): ErgoBoxCandidate;

    /**
    * Add an element to the collection
    * @param {ErgoBoxCandidate} b
    */
    add(b: ErgoBoxCandidate): void;
  }
  /**
  * Collection of ErgoBox'es
  */
  declare export class ErgoBoxes {
    free(): void;

    /**
    * parse ErgoBox array from json
    * @param {Array<ErgoBoxJson>} boxes
    * @returns {ErgoBoxes}
    */
    static from_boxes_json(boxes: Array<ErgoBoxJson>): ErgoBoxes;

    /**
    * Create new collection with one element
    * @param {ErgoBox} b
    */
    constructor(b: ErgoBox): this;

    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len(): number;

    /**
    * Add an element to the collection
    * @param {ErgoBox} b
    */
    add(b: ErgoBox): void;

    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {ErgoBox}
    */
    get(index: number): ErgoBox;
  }
  /**
  * TBD
  */
  declare export class ErgoStateContext {
    free(): void;

    /**
    * empty (dummy) context (for signing P2PK tx only)
    * @returns {ErgoStateContext}
    */
    static dummy(): ErgoStateContext;
  }
  /**
  * The root of ErgoScript IR. Serialized instances of this class are self sufficient and can be passed around.
  */
  declare export class ErgoTree {
    free(): void;

    /**
    * Decode from base16 encoded serialized ErgoTree
    * @param {string} s
    * @returns {ErgoTree}
    */
    static from_base16_bytes(s: string): ErgoTree;

    /**
    * Decode from encoded serialized ErgoTree
    * @param {Uint8Array} data
    * @returns {ErgoTree}
    */
    static from_bytes(data: Uint8Array): ErgoTree;

    /**
    * Encode Ergo tree as serialized bytes
    * @returns {Uint8Array}
    */
    to_bytes(): Uint8Array;
  }
  /**
  * Wrapper for i64 for JS/TS
  */
  declare export class I64 {
    free(): void;

    /**
    * Create from a standard rust string representation
    * @param {string} string
    * @returns {I64}
    */
    static from_str(string: string): I64;

    /**
    * String representation of the value for use from environments that don't support i64
    * @returns {string}
    */
    to_str(): string;

    /**
    * Get the value as JS number (64-bit float)
    * @returns {number}
    */
    as_num(): number;

    /**
    * Addition with overflow check
    * @param {I64} other
    * @returns {I64}
    */
    checked_add(other: I64): I64;
  }
  /**
  * Signed inputs used in signed transactions
  */
  declare export class Input {
    free(): void;

    /**
    * Get box id
    * @returns {BoxId}
    */
    box_id(): BoxId;

    /**
    * Get the spending proof
    * @returns {ProverResult}
    */
    spending_proof(): ProverResult;
  }
  /**
  * Collection of signed inputs
  */
  declare export class Inputs {
    free(): void;

    /**
    * Create empty Inputs
    */
    constructor(): this;

    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len(): number;

    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {Input}
    */
    get(index: number): Input;
  }
  /**
  * helper methods to get the fee address for various networks
  */
  declare export class MinerAddress {
    free(): void;

    /**
    * address to use in mainnet for the fee
    * @returns {string}
    */
    static mainnet_fee_address(): string;

    /**
    * address to use in testnet for the fee
    * @returns {string}
    */
    static testnet_fee_address(): string;
  }
  /**
  * Combination of an Address with a network
  * These two combined together form a base58 encoding
  */
  declare export class NetworkAddress {
    free(): void;

    /**
    * create a new NetworkAddress(address + network prefix) for a given network type
    * @param {$Values<typeof NetworkPrefix>} network
    * @param {Address} address
    * @returns {NetworkAddress}
    */
    static new(network: $Values<typeof NetworkPrefix>, address: Address): NetworkAddress;

    /**
    * Decode (base58) a NetworkAddress (address + network prefix) from string
    * @param {string} s
    * @returns {NetworkAddress}
    */
    static from_base58(s: string): NetworkAddress;

    /**
    * Encode (base58) address
    * @returns {string}
    */
    to_base58(): string;

    /**
    * Decode from a serialized address
    * @param {Uint8Array} data
    * @returns {NetworkAddress}
    */
    static from_bytes(data: Uint8Array): NetworkAddress;

    /**
    * Encode address as serialized bytes
    * @returns {Uint8Array}
    */
    to_bytes(): Uint8Array;

    /**
    * Network for the address
    * @returns {$Values<typeof NetworkPrefix>}
    */
    network(): $Values<typeof NetworkPrefix>;

    /**
    * Get address without network information
    * @returns {Address}
    */
    address(): Address;
  }
  /**
  * Proof of correctness of tx spending
  */
  declare export class ProverResult {
    free(): void;

    /**
    * Get proof
    * @returns {Uint8Array}
    */
    proof(): Uint8Array;

    /**
    * Get extension
    * @returns {ContextExtension}
    */
    extension(): ContextExtension;

    /**
    * JSON representation
    * @returns {any}
    */
    to_json(): any;
  }
  /**
  * Secret key for the prover
  */
  declare export class SecretKey {
    free(): void;

    /**
    * generate random key
    * @returns {SecretKey}
    */
    static random_dlog(): SecretKey;

    /**
    * Parse dlog secret key from bytes (SEC-1-encoded scalar)
    * @param {Uint8Array} bytes
    * @returns {SecretKey}
    */
    static dlog_from_bytes(bytes: Uint8Array): SecretKey;

    /**
    * Address (encoded public image)
    * @returns {Address}
    */
    get_address(): Address;

    /**
    * Encode from a serialized key
    * @returns {Uint8Array}
    */
    to_bytes(): Uint8Array;
  }
  /**
  * SecretKey collection
  */
  declare export class SecretKeys {
    free(): void;

    /**
    * Create empty SecretKeys
    */
    constructor(): this;

    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len(): number;

    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {SecretKey}
    */
    get(index: number): SecretKey;

    /**
    * Adds an elements to the collection
    * @param {SecretKey} elem
    */
    add(elem: SecretKey): void;
  }
  /**
  * Naive box selector, collects inputs until target balance is reached
  */
  declare export class SimpleBoxSelector {
    free(): void;

    /**
    * Create empty SimpleBoxSelector
    */
    constructor(): this;

    /**
    * Selects inputs to satisfy target balance and tokens.
    * `inputs` - available inputs (returns an error, if empty),
    * `target_balance` - coins (in nanoERGs) needed,
    * `target_tokens` - amount of tokens needed.
    * Returns selected inputs and box assets(value+tokens) with change.
    * @param {ErgoBoxes} inputs
    * @param {BoxValue} target_balance
    * @param {Tokens} target_tokens
    * @returns {BoxSelection}
    */
    select(
      inputs: ErgoBoxes,
      target_balance: BoxValue,
      target_tokens: Tokens
    ): BoxSelection;
  }
  /**
  * Token represented with token id paired with it's amount
  */
  declare export class Token {
    free(): void;

    /**
    * Create a token with given token id and amount
    * @param {TokenId} token_id
    * @param {TokenAmount} amount
    */
    constructor(token_id: TokenId, amount: TokenAmount): this;

    /**
    * Get token id
    * @returns {TokenId}
    */
    id(): TokenId;

    /**
    * Get token amount
    * @returns {TokenAmount}
    */
    amount(): TokenAmount;

    /**
    * JSON representation
    * @returns {any}
    */
    to_json(): {|
      tokenId: string,
      amount: number,
    |};
  }
  /**
  * Token amount with bound checks
  */
  declare export class TokenAmount {
    free(): void;

    /**
    * Create from i64 with bounds check
    * @param {I64} v
    * @returns {TokenAmount}
    */
    static from_i64(v: I64): TokenAmount;

    /**
    * Get value as signed 64-bit long (I64)
    * @returns {I64}
    */
    as_i64(): I64;
  }
  /**
  * Token id (32 byte digest)
  */
  declare export class TokenId {
    free(): void;

    /**
    * Create token id from erbo box id (32 byte digest)
    * @param {BoxId} box_id
    * @returns {TokenId}
    */
    static from_box_id(box_id: BoxId): TokenId;

    /**
    * Parse token id (32 byte digets) from base16-encoded string
    * @param {string} str
    * @returns {TokenId}
    */
    static from_str(str: string): TokenId;

    to_str(): string;
  }
  /**
  * Array of tokens
  */
  declare export class Tokens {
    free(): void;

    /**
    * Create empty Tokens
    */
    constructor(): this;

    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len(): number;

    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {Token}
    */
    get(index: number): Token;

    /**
    * Adds an elements to the collection
    * @param {Token} elem
    */
    add(elem: Token): void;
  }
  /**
  * * ErgoTransaction is an estroys Boxes from the state
  * * and creates new ones. If transaction is spending boxes protected by some non-trivial scripts,
  * * its inputs should also contain proof of spending correctness - context extension (user-defined
  * * key-value map) and data inputs (links to existing boxes in the state) that may be used during
  * * script reduction to crypto, signatures that satisfies the remaining cryptographic protection
  * * of the script.
  * * Transactions are not encrypted, so it is possible to browse and view every transaction ever
  * * collected into a block.
  */
  declare export class Transaction {
    free(): void;

    /**
    * Get id for transaction
    * @returns {TxId}
    */
    id(): TxId;

    /**
    * JSON representation
    * @returns {any}
    */
    to_json(): {|
      id: string,
      inputs: Array<{|
        boxId: string, // hex
        spendingProof: {|
          proofBytes: string, // hex
          extension: {| [key: string]: string /* hex */ |},
        |},
        extension?: {| [key: string]: string /* hex */ |},
      |}>,
      dataInputs: Array<{|
        boxId: string, // hex
        extension?: {| [key: string]: string /* hex */ |},
      |}>,
      outputs: Array<{|
        boxId: string,
        value: number,
        ergoTree: string,
        assets: Array<{|
          tokenId: string, // hex
          amount: number,
        |}>,
        additionalRegisters: {| [key: string]: string /* hex */ |},
        creationHeight: number,
        transactionId: string,
        index: number,
      |}>,
    |};

    /**
    * Inputs for transaction
    * @returns {Inputs}
    */
    inputs(): Inputs;

    /**
    * Data inputs for transaction
    * @returns {DataInputs}
    */
    data_inputs(): DataInputs;

    /**
    * Outputs for transaction
    * @returns {ErgoBoxCandidates}
    */
    outputs(): ErgoBoxCandidates;
  }
  /**
  * Unsigned transaction builder
  */
  declare export class TxBuilder {
    free(): void;

    /**
    * Suggested transaction fee (semi-default value used across wallets and dApps as of Oct 2020)
    * @returns {BoxValue}
    */
    static SUGGESTED_TX_FEE(): BoxValue;

    /**
    * Creates new TxBuilder
    * `box_selection` - selected input boxes (via [`BoxSelector`])
    * `output_candidates` - output boxes to be "created" in this transaction,
    * `current_height` - chain height that will be used in additionally created boxes (change, miner's fee, etc.),
    * `fee_amount` - miner's fee,
    * `change_address` - change (inputs - outputs) will be sent to this address,
    * `min_change_value` - minimal value of the change to be sent to `change_address`, value less than that
    * will be given to miners,
    * @param {BoxSelection} box_selection
    * @param {ErgoBoxCandidates} output_candidates
    * @param {number} current_height
    * @param {BoxValue} fee_amount
    * @param {Address} change_address
    * @param {BoxValue} min_change_value
    * @returns {TxBuilder}
    */
    static new(
      box_selection: BoxSelection,
      output_candidates: ErgoBoxCandidates,
      current_height: number,
      fee_amount: BoxValue,
      change_address: Address,
      min_change_value: BoxValue
    ): TxBuilder;

    /**
    * Set transaction's data inputs
    * @param {DataInputs} data_inputs
    */
    set_data_inputs(data_inputs: DataInputs): void;

    /**
    * Build the unsigned transaction
    * @returns {UnsignedTransaction}
    */
    build(): UnsignedTransaction;

    /**
    * Get inputs
    * @returns {BoxSelection}
    */
    box_selection(): BoxSelection;

    /**
    * Get data inputs
    * @returns {DataInputs}
    */
    data_inputs(): DataInputs;

    /**
    * Get outputs EXCLUDING fee and change
    * @returns {ErgoBoxCandidates}
    */
    output_candidates(): ErgoBoxCandidates;

    /**
    * Get current height
    * @returns {number}
    */
    current_height(): number;

    /**
    * Get fee amount
    * @returns {BoxValue}
    */
    fee_amount(): BoxValue;

    /**
    * Get change
    * @returns {Address}
    */
    change_address(): Address;

    /**
    * Get min change value
    * @returns {BoxValue}
    */
    min_change_value(): BoxValue;
  }
  /**
  * Transaction id
  */
  declare export class TxId {
    free(): void;

    /**
    * Zero (empty) transaction id (to use as dummy value in tests)
    * @returns {TxId}
    */
    static zero(): TxId;

    /**
    * get the tx id as bytes
    * @returns {string}
    */
    to_str(): string;

    /**
    * convert a hex string into a TxId
    * @param {string} s
    * @returns {TxId}
    */
    static from_str(s: string): TxId;
  }
  /**
  * Unsigned inputs used in constructing unsigned transactions
  */
  declare export class UnsignedInput {
    free(): void;

    /**
    * Get box id
    * @returns {BoxId}
    */
    box_id(): BoxId;

    /**
    * Get extension
    * @returns {ContextExtension}
    */
    extension(): ContextExtension;
  }
  /**
  * Collection of unsigned signed inputs
  */
  declare export class UnsignedInputs {
    free(): void;

    /**
    * Create empty UnsignedInputs
    */
    constructor(): this;

    /**
    * Returns the number of elements in the collection
    * @returns {number}
    */
    len(): number;

    /**
    * Returns the element of the collection with a given index
    * @param {number} index
    * @returns {UnsignedInput}
    */
    get(index: number): UnsignedInput;
  }
  /**
  * Unsigned (inputs without proofs) transaction
  */
  declare export class UnsignedTransaction {
    free(): void;

    /**
    * Get id for transaction
    * @returns {TxId}
    */
    id(): TxId;

    /**
    * Inputs for transaction
    * @returns {UnsignedInputs}
    */
    inputs(): UnsignedInputs;

    /**
    * Data inputs for transaction
    * @returns {DataInputs}
    */
    data_inputs(): DataInputs;

    /**
    * Outputs for transaction
    * @returns {ErgoBoxCandidates}
    */
    outputs(): ErgoBoxCandidates;

    /**
    * JSON representation
    * @returns {any}
    */
    to_json(): {|
      id: string,
      inputs: Array<{|
        boxId: string,
        extension: {| [key: string]: string /* hex */ |},
      |}>,
      dataInputs: Array<{|
        boxId: string,
      |}>,
      outputs: Array<{|
        boxId: string,
        value: number,
        ergoTree: string,
        assets: Array<{|
          tokenId: string, // hex
          amount: number,
        |}>,
        additionalRegisters: {| [key: string]: string /* hex */ |},
        creationHeight: number,
        transactionId: string,
        index: number,
      |}>,
    |};
  }
  /**
  * A collection of secret keys. This simplified signing by matching the secret keys to the correct inputs automatically.
  */
  declare export class Wallet {
    free(): void;

    /**
    * Create wallet instance loading secret key from mnemonic
    * @param {string} _mnemonic_phrase
    * @param {string} _mnemonic_pass
    * @returns {Wallet}
    */
    static from_mnemonic(
      _mnemonic_phrase: string,
      _mnemonic_pass: string
    ): Wallet;

    /**
    * Create wallet using provided secret key
    * @param {SecretKeys} secret
    * @returns {Wallet}
    */
    static from_secrets(secret: SecretKeys): Wallet;

    /**
    * Sign a transaction:
    * `tx` - transaction to sign
    * `boxes_to_spend` - boxes corresponding to [`UnsignedTransaction::inputs`]
    * `data_boxes` - boxes corresponding to [`UnsignedTransaction::data_inputs`]
    * @param {ErgoStateContext} _state_context
    * @param {UnsignedTransaction} tx
    * @param {ErgoBoxes} boxes_to_spend
    * @param {ErgoBoxes} data_boxes
    * @returns {Transaction}
    */
    sign_transaction(
      _state_context: ErgoStateContext,
      tx: UnsignedTransaction,
      boxes_to_spend: ErgoBoxes,
      data_boxes: ErgoBoxes
    ): Transaction;
  }
}

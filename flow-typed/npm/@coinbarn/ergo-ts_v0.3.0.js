// @flow

declare module '@coinbarn/ergo-ts' {
  declare export  var Network: {|
    +Mainnet: 0, // 0
    +Testnet: 16, // 16
  |};
  declare export  var AddressKind: {|
    +P2PK: 1, // 1
    +P2SH: 2, // 2
    +P2S: 3, // 3
  |};
  declare export class Address {
    get publicKey(): string;
    get ergoTree(): string;
    static fromErgoTree(ergoTree: string, network?: $Values<typeof Network>): Address;
    static fromPk(pk: string, network?: $Values<typeof Network>): Address;
    static fromSk(sk: string, network?: $Values<typeof Network>): Address;
    address: string;
    addrBytes: any;
    constructor(address: string): this;
    isValid(): boolean;
    getNetwork(): $Values<typeof Network>;
    getType(): $Values<typeof AddressKind>;
  }
  declare export class SpendingProof {
    static +empty: SpendingProof;
    proofBytes: string;
    extension: { [key: string]: any, ... };
    constructor(
      proofBytes: string,
      extension?: { [key: string]: any, ... }
    ): this;
  }
  declare export class Input {
    static formObject(obj: any): Input;
    outputTransactionId?: string;
    value?: number;
    address?: string;
    boxId: string;
    spendingProof: SpendingProof;
    constructor(
      boxId: string,
      spendingProof?: SpendingProof,
      address?: string,
      value?: number,
      outputTransactionId?: string
    ): this;
  }
  declare export interface ITokens {
    tokenId: string;
    amount: number;
  }
  declare export class ErgoBox {
    static formObject(obj: any): ErgoBox;
    static extractAssets(boxes: ErgoBox[]): ITokens[];
    static encodeRegisters(obj: any): { ... };
    static getSolvingBoxes(
      myBoxes: ErgoBox[],
      meaningfulOutputs: ErgoBox[],
      min?: number
    ): ErgoBox[];
    static sort(boxes: any): any[];
    id: string;
    value: number;
    creationHeight: number;
    address: Address;
    ergoTree: string;
    assets: any[];
    additionalRegisters: { ... };
    constructor(
      id: string,
      value: number,
      creationHeight: number,
      address: Address,
      assets?: any[],
      additionalRegisters?: { ... }
    ): this;
    toInput(): Input;
  }
  declare export interface IIdObject {
    id?: ?string;
  }
  declare export class Input {
    static formObject(obj: any): Input;
    outputTransactionId?: string;
    value?: number;
    address?: string;
    boxId: string;
    spendingProof: SpendingProof;
    constructor(
      boxId: string,
      spendingProof?: SpendingProof,
      address?: string,
      value?: number,
      outputTransactionId?: string
    ): this;
  }
  declare export class Transaction implements IIdObject {
    /**
    * @param boxesToSpend - boxes to spend
    * @param payloadOutputs - outputs without fee and change
    * @param fee - fee to pay
    */
    static fromOutputs(
      boxesToSpend: ErgoBox[],
      payloadOutputs: ErgoBox[],
      fee?: number
    ): Transaction;
    static formObject(obj: any): Transaction;
    inputs: Input[];
    dataInputs: Input[];
    outputs: ErgoBox[];
    timestamp?: number;
    confirmations?: number;
    headerId?: string;
    id?: ?string;
    constructor(
      inputs: Input[],
      outputs: ErgoBox[],
      dataInputs?: Input[],
      id?: string,
      timestamp?: number,
      headerId?: string,
      confirmationsCount?: number
    ): this;
    sign(sk: string): Transaction;
  }
  declare export class Explorer {
    static +testnet: Explorer;
    static +mainnet: Explorer;
    +apiClient: AxiosInstance;
    url: string;
    timeout: number;
    headers: {
      "Content-Type": string,
      ...
    };
    constructor(url: string): this;
    getCurrentHeight(): Promise<number>;
    getUnspentOutputs(address: Address): Promise<ErgoBox[]>;
    getUnconfirmed(address?: Address): Promise<Transaction[]>;
    getTransactions(address: Address): Promise<Transaction[]>;
    getTokenInfo(tokenId: string): Promise<ErgoBox>;
    broadcastTx(signedTransaction: Transaction): Promise<AxiosResponse<any>>;
    postRequest(url: string, data: any): Promise<AxiosResponse>;
    getRequest(url: string): Promise<AxiosResponse<any>>;
  }
  declare export class Client {
    explorer: Explorer;
    constructor(explorerUri?: string): this;

    /**
    * Transfer ERG or token, specifying the amount in nanoErgs or minimal token units.
    * @param sk - secret key
    * @param recipient - address ot the transaction recipient
    * @param amountInt - amount to transfer in minimal units. Should be integer.
    * @param tokenId - id of a token to send. 'ERG' if  going to send ERG
    */
    transferInt(
      sk: string,
      recipient: string,
      amountInt: number,
      tokenId?: string
    ): Promise<$PropertyType<$Exports<"axios">, "AxiosResponse">>;

    /**
    * Transfer ERG or token.
    * Sent amount may be slightly different from the specified one due to JS float number representation.
    * For exact transfer us transferInt method.
    * @param sk - secret key
    * @param recipient - address ot the transaction recipient
    * @param amount - amount to transfer
    * @param tokenId - id of a token to send. 'ERG' if  going to send ERG
    */
    transfer(
      sk: string,
      recipient: string,
      amount: number,
      tokenId?: string
    ): Promise<$PropertyType<$Exports<"axios">, "AxiosResponse">>;
    tokenIssue(
      sk: string,
      name: string,
      amount: number,
      decimals: number,
      description: string
    ): Promise<$PropertyType<$Exports<"axios">, "AxiosResponse">>;
  }
  declare export class Serializer {
    static outputToBytes(out: ErgoBox, tokenIds: any): string;
    static inputToBytes(input: Input): any;
    static transactionToBytes(tx: Transaction): string;
    static intToVlq(num: number): string;
    static stringToHex(str: string): any;
    static stringFromHex(str: string): any;
    static distinctTokenList(outputs: ErgoBox[]): string[];
    static valueSerialize(v: string): any;
  }
  declare export var feeErgoTree: string; // "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304"
  declare export var feeMainnetAddress: Address;
  declare export var feeTestnetAddress: Address;
  declare export var feeValue: number; // 1000000
  declare export var minBoxValue: number; // 100000
  declare export var unitsInOneErgo: number; // 1000000000
  declare export var heightDelta: number; // 720

  declare export var sign: (msgBytes: any, sk: any) => any;
  declare export var verify: (msgBytes: any, sigBytes: any, pkBytes: any) => any;
}

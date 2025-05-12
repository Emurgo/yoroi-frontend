type File = {
  name?: string;
  mediaType?: string;
  src?: string | Array<string>;
};

type NFTMetadata = {
  name: string;
  image: string | Array<string>;
  mediaType?: string;
  description: string | Array<string>;
  authors: string;
  author: string;
  files?: File[];
};

type PolicyMetadata = {
  [assetNameHex: string]: NFTMetadata;
};

type NFTMintMetadata = {
  version?: string | null;
} & {
  [policyID: string]: PolicyMetadata;
};

type CardanoAssetMintMetadata = {
  // transaction_metadatum_label: 721 for NFTs
  // See CIP 721
  // https://github.com/cardano-foundation/CIPs/blob/8b1f2f0900d81d6233e9805442c2b42aa1779d2d/CIP-NFTMetadataStandard.md
  [key: string]: NFTMintMetadata[];
};

export type Nft = {
  name: string;
  id: string;
  image: string;
  policyId: string;
  ticker: string;
  assetName: string;
  description: string | null;
  author: string | null;
  metadata: CardanoAssetMintMetadata | null;
};

export type NftGalleryContextType = {
  spendableBalance: any;
  getTokenInfo: (identifier: string) => any;
  selectedWallet: any;
};

export type ListColumnView = {
  count: number;
  Icon: React.ReactNode;
  imageDims: string;
};

export type NetworkUrl = {
  cardanoScan: string;
  cexplorer: string;
};

export type Nft = {
  name: string;
  id: string;
  image: string;
};

export type NftGalleryContextType = {
  spendableBalance: any;
  getTokenInfo: (identifier: string) => any;
};

type TokenInfoEntry = {
  website: string;
  description: string;
};

type AssetInfo = {
  id: string;
  name: string;
  policyId: string;
  fingerprint: string;
  metadata: TokenInfoEntry;
  image: string;
  numberOfDecimals: number;
};

type TokenInfoType = {
  assetName: string;
  amountForSorting: string;
  formatedAmount: string;
  quantity: string;
  id: string;
  info: AssetInfo;
};

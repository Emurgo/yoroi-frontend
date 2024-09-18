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
};

type TokenInfoType = {
  name: string;
  assetName: string;
  totalAmount: string;
  amountForSorting: string;
  tokenLogo: string;
  totalAmountFiat: string | number; // The value could be 'NaN', so we can represent it as either a string or a number.
  price: number | null;
  quantity: string;
  id: string;
  info: AssetInfo;
};

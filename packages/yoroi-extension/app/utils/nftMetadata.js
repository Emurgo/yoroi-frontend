//@flow

import type {
  CardanoAssetMintMetadata,
  NFTMetadata,
  TokenMetadata,
} from '../api/ada/lib/storage/database/primitives/tables';
import { hexToBytes } from '../coreUtils';

export function find721metadata(
  policyId: string,
  assetNameHex: string,
  assetMintMetadata: ?Array<CardanoAssetMintMetadata>,
): NFTMetadata | null {
  if (!assetMintMetadata) {
    return null;
  }
  const metadataWrapper = assetMintMetadata.find(m => m['721'] != null);
  if (metadataWrapper === undefined) {
    return null;
  }
  const metadata = metadataWrapper['721'];
  const assetName = Array.from(hexToBytes(assetNameHex)).map(
    c => String.fromCharCode(c)
  ).join('');
  const asset: any = metadata[policyId]?.[assetName] || metadata[policyId]?.[assetNameHex];
  if (!asset) {
    return null;
  }

  // Note that `asset` is from the backend via asset metadata query, which in turn
  // gets the data from the blockchain, but none of the step actually verifies that
  // it conforms to the structure defined by CIP 25 - NFT Metadata Standard. In order
  // to avoid causing error in the user of this data, we normalize the data to
  // guarentee that the return value conforms to the `NFTMetadata` type.
  const ret: any = {};
  if (typeof asset.name === 'string') {
    ret.name = asset.name;
  } else {
    ret.name = '';
  }
  if (
    typeof asset.image === 'string' || (
      Array.isArray(asset.image) &&  asset.image.every(i => typeof i === 'string')
    )
  ) {
    ret.image = asset.image;
  }
  if (typeof asset.mediaType === 'string') {
    ret.mediaType = asset.mediaType;
  }
  if (
    typeof asset.description === 'string' || (
      Array.isArray(asset.description) && asset.description.every(i => typeof i === 'string')
    )
  ) {
    ret.description = asset.description;
  }
  if (
    Array.isArray(asset.files) &&
      asset.files.every(({ name, mediaType, src }) => (
        typeof name === 'string' &&
          typeof mediaType === 'string' &&
          (
            typeof src === 'string' ||
              (Array.isArray(src) && src.every(s => typeof s === 'string'))
          )
      ))
  ) {
    ret.files = asset.files;
  }

  if (typeof asset.author === 'string') ret.author = asset.author
  if (typeof asset.authors === 'string') ret.author = asset.authors

  return ret;
}

export function getImageFromTokenMetadata(
  policyId: string,
  assetNameHEX: string | void,
  tokenMetadata: TokenMetadata,
): string | null {
  if (tokenMetadata.type !== 'Cardano' || assetNameHEX == null) {
    return null;
  }
  const nftMetadata = find721metadata(
    policyId,
    assetNameHEX,
    tokenMetadata.assetMintMetadata,
  );

  if (!nftMetadata) {
    return null;
  }
  if (typeof nftMetadata.image === 'string') {
    return nftMetadata.image;
  }
  if (
    Array.isArray(nftMetadata.image) &&
      nftMetadata.image.every(s => typeof s === 'string')
  ) {
    return nftMetadata.image.join('');
  }
  return null;
}

export function getAuthorFromTokenMetadata(
  policyId: string,
  name: string | void,
  tokenMetadata: TokenMetadata,
): string | null {
  if (tokenMetadata.type !== 'Cardano' || name == null) {
    return null;
  }
  const nftMetadata = find721metadata(
    policyId,
    name,
    tokenMetadata.assetMintMetadata,
  );

  if (!nftMetadata) {
    return null;
  }

  if (typeof nftMetadata.author === 'string') {
    return nftMetadata.author;
  }
  if (typeof nftMetadata.authors === 'string') {
    return nftMetadata.authors;
  }
  return null;
}

export function getDescriptionFromTokenMetadata(
  policyId: string,
  name: string | void,
  tokenMetadata: TokenMetadata,
): string | null {
  if (tokenMetadata.type !== 'Cardano' || name == null) {
    return null;
  }
  const nftMetadata = find721metadata(
    policyId,
    name,
    tokenMetadata.assetMintMetadata,
  );

  if (!nftMetadata) {
    return null;
  }
  if (typeof nftMetadata.description === 'string') {
    return nftMetadata.description;
  }
  if (Array.isArray(nftMetadata.description)) {
    return nftMetadata.description.join('');
  }
  return null;
}

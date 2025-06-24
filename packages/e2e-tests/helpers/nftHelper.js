/**
 * Parses metadata into a NFT object
 * @param {string} metadata
 * @param {string} tokenPolicyId
 * @param {string} tokenName
 * @returns {{description: string, image: string, mediaType: string, name: string, tokenType: string, totalSupply: number}}
 */
export const parseNftMetadata = (metadata, tokenPolicyId, tokenName) => {
  const metadataObj = JSON.parse(metadata);
  const metadataInfo = metadataObj['721'][tokenPolicyId][tokenName];
  return {
    description: metadataInfo.description,
    image: metadataInfo.image,
    mediaType: metadataInfo.mediaType,
    name: metadataInfo.name,
    tokenType: metadataInfo.tokenType,
    totalSupply: metadataInfo.totalSupply,
  };
};

/**
 * Compares https link from the NFT page with IPFS link
 * @param {string} httpsLink
 * @param {string} ipfsLink
 */
export const isImageIdsSame = (httpsLink, ipfsLink) => {
  const httpsLinkParts = httpsLink.split('/');
  const httpsLinkImageId = httpsLinkParts[httpsLinkParts.length - 1];
  const ipfsLinkParts = ipfsLink.split('/');
  const ipfsLinkImageId = ipfsLinkParts[ipfsLinkParts.length - 1];
  return httpsLinkImageId === ipfsLinkImageId;
};

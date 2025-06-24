export const parseNftMetadata = (metadata, tokenPolicyId, tokenName) => {
  const metadataObj = JSON.parse(metadata);
  const metadataInfo = metadataObj["721"][tokenPolicyId][tokenName];
  return {
    description: metadataInfo.description,
    image: metadataInfo.image,
    mediaType: metadataInfo.mediaType,
    name: metadataInfo.name,
    tokenType: metadataInfo.tokenType,
    totalSupply: metadataInfo.totalSupply,
  };
};

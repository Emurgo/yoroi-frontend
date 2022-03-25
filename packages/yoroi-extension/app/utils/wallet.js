// @flow

import { genFormatTokenAmount, getTokenIdentifierIfExists, getTokenStrictName } from '../stores/stateless/tokenHelpers';
import { truncateToken } from './formatters';

export const getTokens = (spendableBalance, getTokenInfo) => {
    if (spendableBalance == null) return [];
    return [
            ...spendableBalance.nonDefaultEntries(),
        ].map(entry => ({
            entry,
            info: getTokenInfo(entry),
        })).filter(token => !token.info.IsNFT).map(token => {
            const amount = genFormatTokenAmount(getTokenInfo)(token.entry)
            return {
                value: token.info.TokenId,
                info: token.info,
                label: truncateToken(getTokenStrictName(token.info) ?? getTokenIdentifierIfExists(token.info) ?? '-'),
                id: (getTokenIdentifierIfExists(token.info) ?? '-'),
                amount: Number(amount),
                included: false,
            }
        });
}

export const getNFTs = (spendableBalance, getTokenInfo) => {
    if (spendableBalance == null) return [];
    return [
    ...spendableBalance.nonDefaultEntries(),
    ].map(entry => ({
    entry,
    info: getTokenInfo(entry),
    })).filter(token => token.info.IsNFT).map(token => {
    const policyId = token.entry.identifier.split('.')[0];
    const name = truncateToken(getTokenStrictName(token.info) ?? '-');
    return {
        name,
        id: getTokenIdentifierIfExists(token.info) ?? '-',
        amount: genFormatTokenAmount(getTokenInfo)(token.entry),
        policyId,
        // $FlowFixMe[prop-missing]
        nftMetadata: token.info.Metadata.assetMintMetadata?.[0]['721'][policyId][name],
    };
    })
    .map(item => ({
        name: item.name,
        image: item.nftMetadata?.image,
    }));
}
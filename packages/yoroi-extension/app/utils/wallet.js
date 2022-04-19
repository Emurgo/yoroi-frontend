// @flow
import { genFormatTokenAmount, getTokenIdentifierIfExists, getTokenStrictName } from '../stores/stateless/tokenHelpers';
import { truncateToken } from './formatters';
import type { TokenRow } from '../api/ada/lib/storage/database/primitives/tables';
import type {
    TokenLookupKey,
    MultiToken
} from '../api/common/lib/MultiToken';

export type FormattedTokenDisplay = {|
    value: number,
    info: $ReadOnly<TokenRow>,
    label: string,
    id: string,
    amount: string,
    included: boolean,
|}

export type FormattedNFTDisplay = {|
    id: string,
    image?: string,
    name: string,
|}

export const getTokens: (
    spendableBalance: ?MultiToken,
    getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>
    ) => FormattedTokenDisplay[] = ( spendableBalance, getTokenInfo ) => {
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
                amount,
            }
        });
}

export const getNFTs: (
    spendableBalance: ?MultiToken,
    getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>
    ) => FormattedNFTDisplay[] = (spendableBalance, getTokenInfo) => {
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
        id: item.id,
    }));
}
// @flow
import { genFormatTokenAmount, getTokenIdentifierIfExists, getTokenStrictName } from '../stores/stateless/tokenHelpers';
import { truncateToken } from './formatters';
import type { TokenRow } from '../api/ada/lib/storage/database/primitives/tables';
import type {
    TokenLookupKey,
    MultiToken
} from '../api/common/lib/MultiToken';
import { getImageFromTokenMetadata } from './nftMetadata';

export type FormattedTokenDisplay = {|
    value?: number,
    info: $ReadOnly<TokenRow>,
    label: string,
    id: string,
    amount?: string,
|}

export type FormattedNFTDisplay = {|
    id?: string,
    image: string | null,
    name: string,
    info: $ReadOnly<TokenRow>,
|}

type GetTokenFunc = (
    spendableBalance: ?MultiToken,
    getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>
) => FormattedTokenDisplay[]

export const getTokens: GetTokenFunc = (spendableBalance, getTokenInfo) => {
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

type GetNFTFunc = (
    spendableBalance: ?MultiToken,
    getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>
) => FormattedNFTDisplay[]

export const getNFTs: GetNFTFunc = (spendableBalance, getTokenInfo) => {
    if (spendableBalance == null) return [];
    return [
        ...spendableBalance.nonDefaultEntries(),
    ].map(entry => ({
        entry,
        info: getTokenInfo(entry),
    }))
    .filter(token => token.info.IsNFT)
    .map(token => {
        const policyId = token.entry.identifier.split('.')[0];
        const name = truncateToken(getTokenStrictName(token.info) ?? '-');
        return {
            name,
            id: getTokenIdentifierIfExists(token.info) ?? '-',
            image: getImageFromTokenMetadata(policyId, name, token.info.Metadata),
            info: token.info,
        };
    });
}

export function checkNFTImage(imageSrc: string, onload: void => void, onerror: void => void): void {
    const img = new Image();
    img.onload = onload;
    img.onerror = onerror;
    img.src = imageSrc;
}

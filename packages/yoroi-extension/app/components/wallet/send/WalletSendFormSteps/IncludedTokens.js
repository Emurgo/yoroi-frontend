// @flow
import type { Node } from 'react'
import { Component } from 'react';
import type { FormattedNFTDisplay, FormattedTokenDisplay } from '../../../../utils/wallet';
import styles from './IncludedTokens.scss';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import NoAssetLogo from '../../../../assets/images/assets-page/asset-no.inline.svg';
import globalMessages from '../../../../i18n/global-messages';
import RemoveIcon from '../../../../assets/images/forms/close.inline.svg';
import NoNFT from '../../../../assets/images/nft-no.inline.svg';
import type {
  TokenLookupKey,
  MultiToken
} from '../../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import { truncateToken } from '../../../../utils/formatters';
import { getTokenIdentifierIfExists, getTokenStrictName } from '../../../../stores/stateless/tokenHelpers';

type Props = {|
  +totalAmount: ?MultiToken,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
|}
export default class IncludedTokens extends Component<Props> {

    static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
        intl: intlShape.isRequired,
    };

    renderTokens(tokens: FormattedTokenDisplay[]): Node {
      return (
        tokens.map(({ token, amount }) => ({
          label: truncateToken(getTokenStrictName(token) ?? getTokenIdentifierIfExists(token) ?? '-'),
          amount: amount.toString(),
          info: token,
        })).map(token => (
          <div className={styles.tokenRow} key={token.id}>
            <div className={styles.token}>
              <div className={styles.label}>
                <NoAssetLogo />
                <p>{token.label}</p>
              </div>
              <p className={styles.amount}>{token.amount}</p>
            </div>

            <div>
              <button onClick={() => this.props.onRemoveToken(token.info)} type='button' className={styles.remove}> <RemoveIcon /> </button>
            </div>
          </div>
        ))
      )
    }

    renderNfts(nfts: FormattedNFTDisplay[]): Node {
      return (
        nfts.map(({ token }) => {
          const policyId = token.Identifier.split('.')[0];
          return {
              name: truncateToken(getTokenStrictName(token) ?? '-'),
              // $FlowFixMe[prop-missing]
              image: token.Metadata.assetMintMetadata?.[0]['721'][policyId][name]?.image,
              info: token,
          };
        }).map(nft => {
          const image = nft.image != null ? nft.image.replace('ipfs://', '') : '';

          return (
            <div className={styles.nftRow} key={nft.name}>
              <div className={styles.nft}>
                <div className={styles.nftImg}>
                  {image ? <img src={`https://ipfs.io/ipfs/${image}`} alt={nft.name} loading="lazy" /> : <NoNFT />}
                </div>
                <p className={styles.name}>{nft.name}</p>
              </div>

              <div>
                <button type='button' onClick={() => this.props.onRemoveToken(nft.info)} className={styles.remove}> <RemoveIcon /> </button>
              </div>
            </div>
          )
        })
      )
    }

    render(): Node {
      const { intl } = this.context
      const { plannedTxInfoMap } = this.props;
      // Todo: Filter tokens by using `IsNFT`
      const tokens = plannedTxInfoMap.filter(({ token }) => !token.IsNFT && !token.IsDefault);
      const nfts = plannedTxInfoMap.filter(({ token }) => token.IsNFT);
      return (
        <div className={styles.component}>
          {
            tokens.length > 0 && (
              <div>
                <h1 className={styles.header}>{intl.formatMessage(globalMessages.tokens)}</h1>
                <div>
                  {this.renderTokens(tokens)}
                </div>
              </div>
            )
          }
          {
            nfts.length > 0 && (
              <div>
                <h1 className={styles.header}>{intl.formatMessage(globalMessages.nfts)}</h1>
                <div>
                  {this.renderNfts(nfts)}
                </div>
              </div>
            )
          }
        </div>
      )
    }
}
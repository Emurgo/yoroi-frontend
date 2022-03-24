// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import styles from './AddNFTDialog.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import {
  MultiToken,
} from '../../../../api/common/lib/MultiToken';
import { genFormatTokenAmount, getTokenStrictName, getTokenIdentifierIfExists, } from '../../../../stores/stateless/tokenHelpers';
import SearchIcon from '../../../../assets/images/assets-page/search.inline.svg';
import NoItemsFoundImg from '../../../../assets/images/dapp-connector/no-websites-connected.inline.svg'
import { truncateToken } from '../../../../utils/formatters';


type Props = {|
  +onClose: void => void,
  +spendableBalance: ?MultiToken,
|};

type State = {|
  nftsList: Asset[],
|}



export const messages: Object = defineMessages({
  nameAndTicker: {
    id: 'wallet.assets.nameAndTicker',
    defaultMessage: '!!!Name and ticker',
  },
  quantity: {
    id: 'wallet.assets.quantity',
    defaultMessage: '!!!Quantity',
  },
  identifier: {
    id: 'wallet.assets.fingerprint',
    defaultMessage: '!!!Fingerprint',
  },
  search: {
    id: 'wallet.assets.search',
    defaultMessage: '!!!Search',
  },
  noAssetFound: {
    id: 'wallet.assets.noAssetFound',
    defaultMessage: '!!!No Asset Found',
  },
  noTokensYet: {
    id: 'wallet.send.form.dialog.noTokensYet',
    defaultMessage: '!!!There are no tokens in your wallet yet'
  },
  minAda: {
    id: 'wallet.send.form.dialog.minAda',
    defaultMessage: '!!!min-ada'
  },
  add: {
    id: 'wallet.send.form.dialog.add',
    defaultMessage: '!!!add'
  },
  nNft: {
    id: 'wallet.send.form.dialog.nNft',
    defaultMessage: '!!!NFT ({number})',
  },
});

@observer
export default class AddNFTDialog extends Component<Props, State> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  componentDidMount(): void {
    this.setState({ nftsList: this.genNftsList() })
  }


  state: State = {
    nftsList: [],
  };

  search: ((e: SyntheticEvent<HTMLInputElement>) => void) =
    (event: SyntheticEvent<HTMLInputElement>) => {
      const keyword = event.currentTarget.value
      this.setState({ nftsList: this.genNftsList() })
      if(!keyword) return
      const regExp = new RegExp(keyword, 'gi')
      const nftsListCopy = [...this.genNftsList()]
      const filteredNftsList = nftsListCopy.filter(a => a.name.match(regExp))
      this.setState({ nftsList: filteredNftsList })
    };

  genNftsList: void => void = () => {
      if (this.props.spendableBalance == null) return [];
      const { spendableBalance } = this.props;
      return [
        ...spendableBalance.nonDefaultEntries(),
      ].map(entry => ({
        entry,
        info: this.props.getTokenInfo(entry),
      })).filter(token => token.info.IsNFT).map(token => {
        const policyId = token.entry.identifier.split('.')[0];
        const name = truncateToken(getTokenStrictName(token.info) ?? '-');
        return {
          name,
          id: getTokenIdentifierIfExists(token.info) ?? '-',
          amount: genFormatTokenAmount(this.props.getTokenInfo)(token.entry),
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

  render(): Node {
    const { intl } = this.context;
    const { onClose } = this.props
    const { nftsList } = this.state

    return (
      <Dialog
        title={intl.formatMessage(messages.nNft, { number: nftsList.length })}
        closeOnOverlayClick={false}
        className={styles.dialog}
        onClose={onClose}
        closeButton={<DialogCloseButton />}
      >
        <div className={styles.component}>
          <div className={styles.search}>
            <SearchIcon />
            <input onChange={this.search} className={styles.searchInput} type="text" placeholder={intl.formatMessage(messages.search)} />
          </div>
          <div className={styles.minAda}>
            <p><span className={styles.minAdaLabel}>{intl.formatMessage(messages.minAda)}{':'}</span> {0}</p>
          </div>
          {
            nftsList.length === 0 ? (
              <div className={styles.noAssetFound}>
                <NoItemsFoundImg />
                <h1 className={styles.text}>
                  {intl.formatMessage(
                    this.genNftsList().length === 0 ? messages.noTokensYet : messages.noAssetFound
                  )}
                </h1>
              </div>
            ): (
              <>
                <div className={styles.nftsGrid}>
                  {
                    nftsList.map(nft => {
                      const image = nft.image != null ? nft.image.replace('ipfs://', '') : '';

                      return (
                        <div className={styles.nftCard}>
                          {image && <img src={`https://ipfs.io/ipfs/${image}`} alt={nft.name} loading="lazy" />}
                          <p className={styles.nftName}>{nft.name }</p>
                        </div>
                      )
                    })
                  }
                </div>
              </>
            )
          }

          <button type='button' className={styles.add}>{intl.formatMessage(messages.add)}</button>
        </div>
      </Dialog>
    );
  }
}

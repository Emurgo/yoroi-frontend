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
import SearchIcon from '../../../../assets/images/assets-page/search.inline.svg';
import NoItemsFoundImg from '../../../../assets/images/dapp-connector/no-websites-connected.inline.svg';
import NoNFT from '../../../../assets/images/nft-no.inline.svg';
import { getNFTs } from '../../../../utils/wallet';
import type { FormattedNFTDisplay } from '../../../../utils/wallet';
import BigNumber from 'bignumber.js';
import type {
  TokenLookupKey,
} from '../../../../api/common/lib/MultiToken';
import type { TokenRow, NetworkRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import classnames from 'classnames';
import { Button } from '@mui/material';
import { isCardanoHaskell } from '../../../../api/ada/lib/storage/database/prepackaged/networks';
import { genFormatTokenAmount } from '../../../../stores/stateless/tokenHelpers';

type Props = {|
  +onClose: void => void,
  +spendableBalance: ?MultiToken,
  +classicTheme: boolean,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +updateAmount: (?BigNumber) => void,
  +defaultToken: $ReadOnly<TokenRow>,
  +isTokenIncluded: ($ReadOnly<TokenRow>) => boolean,
  +onAddToken: ({|
    token: void | $ReadOnly<TokenRow>,
    shouldReset?: boolean,
  |}) => void,
  +totalInput: ?MultiToken,
  +fee: ?MultiToken,
  +selectedNetwork: $ReadOnly<NetworkRow>,
  +onRemoveToken: (void | $ReadOnly<TokenRow>) => void,
  +isCalculatingFee: boolean,
|};

type State = {|
  currentNftsList: FormattedNFTDisplay[],
  fullNftsList: FormattedNFTDisplay[],
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
    const { spendableBalance, getTokenInfo } = this.props;
    const nftsList = getNFTs(spendableBalance, getTokenInfo)
    this.setState({ fullNftsList: nftsList,  currentNftsList: nftsList })
  }


  state: State = {
    currentNftsList: [],
    fullNftsList: []
  };

  search: ((e: SyntheticEvent<HTMLInputElement>) => void) =
    (event: SyntheticEvent<HTMLInputElement>) => {
      const keyword = event.currentTarget.value
      this.setState((prev) => ({ currentNftsList: prev.fullNftsList }))
      if(!keyword) return
      const regExp = new RegExp(keyword, 'gi')
      const nftsListCopy = [...this.state.fullNftsList]
      const filteredNftsList = nftsListCopy.filter(a => a.name.match(regExp))
      this.setState({ currentNftsList: filteredNftsList })
    };

  onSelect: $ReadOnly<TokenRow> => void = (token) => {
    if (this.props.isTokenIncluded(token)) {
      this.props.onRemoveToken(token)
    } else {
      this.props.onAddToken({
        token, shouldReset: false
      })
      const amount = new BigNumber('1')
      this.props.updateAmount(amount)
    }
  }


  renderMinAda(): string {
    const { totalInput, fee, isCalculatingFee } = this.props
    if (isCalculatingFee) return '...';
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);
    if (!totalInput || !fee) return '0.0';
    const amount = totalInput.joinSubtractCopy(fee);
    return formatValue(amount.getDefaultEntry());
  }

  render(): Node {
    const { intl } = this.context;
    const { onClose } = this.props
    const { currentNftsList, fullNftsList } = this.state

    return (
      <Dialog
        title={intl.formatMessage(messages.nNft, { number: fullNftsList.length })}
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
          {isCardanoHaskell(this.props.selectedNetwork) && (
          <div className={styles.minAda}>
            <p>
              <span className={styles.label}>{intl.formatMessage(messages.minAda)}{':'}</span>
              <span>{this.renderMinAda()}</span>
            </p>
          </div>
         )}
          {
            currentNftsList.length === 0 ? (
              <div className={styles.noAssetFound}>
                <NoItemsFoundImg />
                <h1 className={styles.text}>
                  {intl.formatMessage(
                    fullNftsList.length === 0 ? messages.noTokensYet : messages.noAssetFound
                  )}
                </h1>
              </div>
            ): (
              <>
                <div className={styles.nftsGrid}>
                  {
                    currentNftsList.map(nft => {
                      const image = nft.image != null ? nft.image.replace('ipfs://', '') : '';
                      return (
                        <button
                          type="button"
                          className={
                          classnames([
                            styles.nftCard,
                            this.props.isTokenIncluded(nft.info) &&styles.selected])
                          }
                          onClick={() => this.onSelect(nft.info)}
                        >
                          {image ? <img src={`https://ipfs.io/ipfs/${image}`} alt={nft.name} loading="lazy" /> : <NoNFT /> }
                          <p className={styles.nftName}>{nft.name}</p>
                        </button>
                      )
                    })
                  }
                </div>
              </>
            )
          }
        </div>
        <Button
          sx={{
            width: '100%',
            height: '61px',
            borderRadius: '0px',
            color: 'var(--yoroi-palette-secondary-300)',
          }}
          onClick={onClose}
          variant='ternary'
        >
          {intl.formatMessage(messages.add)}
        </Button>
      </Dialog>
    );
  }
}

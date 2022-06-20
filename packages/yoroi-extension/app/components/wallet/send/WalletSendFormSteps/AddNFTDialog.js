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
import { ReactComponent as SearchIcon } from '../../../../assets/images/assets-page/search.inline.svg';
import { ReactComponent as NoItemsFoundImg } from '../../../../assets/images/assets-page/no-nfts.inline.svg';
import { getNFTs } from '../../../../utils/wallet';
import type { FormattedNFTDisplay } from '../../../../utils/wallet';
import BigNumber from 'bignumber.js';
import type {
  TokenLookupKey,
} from '../../../../api/common/lib/MultiToken';
import type { TokenRow, NetworkRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import classnames from 'classnames';
import { Button, OutlinedInput } from '@mui/material';
import { isCardanoHaskell } from '../../../../api/ada/lib/storage/database/prepackaged/networks';
import MinAda from './MinAda';
import NFTImage from './NFTImage';
import globalMessages from '../../../../i18n/global-messages';
import MaxAssetsError from '../MaxAssetsError';
import { Box } from '@mui/system';

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
  noNFTsFound: {
    id: 'wallet.send.form.dialog.noNFTsFound',
    defaultMessage: '!!!No NFTs found',
  },
  noNFTsYet: {
    id: 'wallet.send.form.dialog.noNFTsYet',
    defaultMessage: '!!!There are no NFTs in your wallet yet'
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
    fullNftsList: [],
    selectedTokens: [],
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

  onSelect: $ReadOnly<TokenRow> => void = (tokenInfo) => {
    if (this.isTokenIncluded(tokenInfo)) {
      this.onRemoveToken(tokenInfo)
    } else {
      this.setState(prev =>({ selectedTokens: [...prev.selectedTokens, tokenInfo] }))
    }
  }

  onRemoveToken = (tokenInfo) => {
    this.setState(prev => ({ ...prev,  selectedTokens: [...prev.selectedTokens].filter(
      t => t.Identifier !== tokenInfo.Identifier) }))
    this.props.onRemoveToken(tokenInfo)
  }

  isTokenIncluded = (token) => {
    const isIncluded = this.state.selectedTokens.find(t => t.Identifier === token.Identifier)
    return isIncluded || this.props.isTokenIncluded(token)
  }

  onAddAll = () => {
    const amount = new BigNumber('1');
    for (const token of this.state.selectedTokens) {
      this.props.onAddToken({
        token, shouldReset: false
      })
      this.props.updateAmount(amount)
    }

    this.props.onClose();
  }

  render(): Node {
    const { intl } = this.context;
    const {
      onClose,
      totalInput,
      fee,
      isCalculatingFee,
      getTokenInfo,
      numOfTokensIncluded,
      maxAssetsAllowed
    } = this.props
    const { currentNftsList, fullNftsList, selectedTokens } = this.state
    const shouldAddMoreAssets = numOfTokensIncluded + selectedTokens.length <= maxAssetsAllowed

    return (
      <Dialog
        title={
          fullNftsList.length === 0 ?
            intl.formatMessage(globalMessages.nfts)
            : intl.formatMessage(messages.nNft, { number: fullNftsList.length })
        }
        closeOnOverlayClick={false}
        className={styles.dialog}
        onClose={onClose}
        closeButton={<DialogCloseButton />}
      >
        <div className={styles.component}>
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Box sx={{ position: 'absolute', top: '55%', left: '10px', transform: 'translateY(-50%)' }}> <SearchIcon /> </Box>
            <OutlinedInput
              onChange={this.search}
              sx={{ padding: '0px 0px 0px 30px', height: '40px', width: '100%', fontSize: '14px', lineHeight: '22px', }}
              placeholder={intl.formatMessage(messages.search)}
            />
          </Box>
          {isCardanoHaskell(this.props.selectedNetwork) && (
          <div className={styles.minAda}>
            <MinAda
              totalInput={totalInput}
              fee={fee}
              isCalculatingFee={isCalculatingFee}
              getTokenInfo={getTokenInfo}
            />
          </div>
         )}

          {!shouldAddMoreAssets && (
          <Box marginTop='10px'>
            <MaxAssetsError maxAssetsAllowed={maxAssetsAllowed} />
          </Box>
         )}
          {
            currentNftsList.length === 0 ? (
              <div className={styles.noAssetFound}>
                <NoItemsFoundImg />
                <h1 className={styles.text}>
                  {intl.formatMessage(
                    fullNftsList.length === 0 ? messages.noNFTsYet : messages.noNFTsFound
                  )}
                </h1>
              </div>
            ): (
              <>
                <div className={styles.nftsGrid}>
                  {
                    currentNftsList.map(nft => {
                      const isIncluded = this.isTokenIncluded(nft.info)
                      return (
                        <button
                          type="button"
                          key={nft.info.Identifier}
                          className={
                          classnames([
                            styles.nftCard,
                            isIncluded && styles.selected])
                          }
                          onClick={() => this.onSelect(nft.info)}
                        >
                          <NFTImage image={nft.image} name={nft.name} width={155} height={190} />
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
        {fullNftsList.length !== 0 && (
          <Button
            sx={{
              width: '100%',
              height: '61px',
              borderRadius: '0px',
              color: 'var(--yoroi-palette-secondary-300)',
            }}
            disabled={selectedTokens.length === 0 || !shouldAddMoreAssets}
            onClick={this.onAddAll}
            variant='ternary'
          >
            {intl.formatMessage(messages.add)}
          </Button>
        )}
      </Dialog>
    );
  }
}

// @flow
/* eslint react/jsx-one-expression-per-line: 0 */ // the &nbsp; in the html breaks this
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import styles from './AddNFTDialog.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { MultiToken } from '../../../../api/common/lib/MultiToken';
import { ReactComponent as SearchIcon } from '../../../../assets/images/assets-page/search.inline.svg';
import { ReactComponent as NoItemsFoundImg } from '../../../../assets/images/assets-page/no-nfts.inline.svg';
import { getNFTs } from '../../../../utils/wallet';
import type { FormattedNFTDisplay } from '../../../../utils/wallet';
import BigNumber from 'bignumber.js';
import type { TokenLookupKey } from '../../../../api/common/lib/MultiToken';
import type {
  TokenRow,
  NetworkRow,
} from '../../../../api/ada/lib/storage/database/primitives/tables';
import { Button, OutlinedInput, Typography } from '@mui/material';
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
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +updateAmount: (?BigNumber) => void,
  +onAddToken: ({|
    token: void | $ReadOnly<TokenRow>,
    shouldReset?: boolean,
  |}) => void,
  +selectedNetwork: $ReadOnly<NetworkRow>,
  +onRemoveTokens: (Array<$ReadOnly<TokenRow>>) => void,
  +shouldAddMoreTokens: (Array<{| token: $ReadOnly<TokenRow>, included: boolean |}>) => boolean,
  +calculateMinAda: (Array<{| token: $ReadOnly<TokenRow>, included: boolean |}>) => string,
  +plannedTxInfoMap: Array<{|
    token: $ReadOnly<TokenRow>,
    amount?: string,
    shouldSendAll?: boolean,
  |}>,
|};

type State = {|
  currentNftsList: FormattedNFTDisplay[],
  fullNftsList: FormattedNFTDisplay[],
  selectedTokens: Array<{|
    token: $ReadOnly<TokenRow>,
    included: boolean,
  |}>,
|};

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
    defaultMessage: '!!!There are no NFTs in your wallet yet',
  },
  nNft: {
    id: 'wallet.send.form.dialog.nNft',
    defaultMessage: '!!!NFT ({number})',
  },
});

@observer
export default class AddNFTDialog extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  componentDidMount(): void {
    const { spendableBalance, getTokenInfo, plannedTxInfoMap } = this.props;
    const nftsList = getNFTs(spendableBalance, getTokenInfo);
    const selectedTokens = plannedTxInfoMap
      .filter(({ token }) => token.IsNFT)
      .map(({ token }) => ({ token, included: true }));

    this.setState({ fullNftsList: nftsList, currentNftsList: nftsList, selectedTokens });
  }

  state: State = {
    currentNftsList: [],
    fullNftsList: [],
    selectedTokens: [],
  };

  search: (e: SyntheticEvent<HTMLInputElement>) => void = (
    event: SyntheticEvent<HTMLInputElement>
  ) => {
    const keyword = event.currentTarget.value;
    this.setState(prev => ({ currentNftsList: prev.fullNftsList }));
    if (!keyword) return;
    const regExp = new RegExp(keyword, 'gi');
    const nftsListCopy = [...this.state.fullNftsList];
    const filteredNftsList = nftsListCopy.filter(a => a.name.match(regExp));
    this.setState({ currentNftsList: filteredNftsList });
  };

  onSelect: ($ReadOnly<TokenRow>) => void = token => {
    if (this.isTokenIncluded(token)) {
      this.onRemoveToken(token);
    } else {
      const selectedTokens = [...this.state.selectedTokens].filter(
        ({ token: t }) => t.Identifier !== token.Identifier
      );
      this.setState({ selectedTokens: [...selectedTokens, { token, included: true }] });
    }
  };

  onRemoveToken: ($ReadOnly<TokenRow>) => void = token => {
    const filteredTokens = [...this.state.selectedTokens].filter(
      ({ token: t }) => t.Identifier !== token.Identifier
    );
    this.setState({ selectedTokens: [...filteredTokens, { token, included: false }] });
  };

  isTokenIncluded: ($ReadOnly<TokenRow>) => boolean = token => {
    return !!this.state.selectedTokens.find(({ token: t }) => t.Identifier === token.Identifier)
      ?.included;
  };

  onAddAll: void => void = () => {
    const amount = new BigNumber('1');
    const toRemove = [];
    for (const { token, included } of this.state.selectedTokens) {
      if (!included) {
        toRemove.push(token);
        continue;
      }
      this.props.onAddToken({
        token,
        shouldReset: false,
      });
      this.props.updateAmount(amount);
    }
    this.props.onRemoveTokens(toRemove);
    this.props.onClose();
  };

  render(): Node {
    const { intl } = this.context;
    const { onClose, calculateMinAda, shouldAddMoreTokens } = this.props;
    const { currentNftsList, fullNftsList, selectedTokens } = this.state;
    const shouldAddMore = shouldAddMoreTokens(selectedTokens);
    return (
      <Dialog
        title={
          fullNftsList.length === 0
            ? intl.formatMessage(globalMessages.nfts)
            : intl.formatMessage(messages.nNft, { number: fullNftsList.length })
        }
        closeOnOverlayClick={false}
        className={styles.dialog}
        onClose={onClose}
        closeButton={<DialogCloseButton />}
      >
        <div className={styles.component}>
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Box
              sx={{ position: 'absolute', top: '55%', left: '10px', transform: 'translateY(-50%)' }}
            >
              {' '}
              <SearchIcon />{' '}
            </Box>
            <OutlinedInput
              onChange={this.search}
              sx={{
                padding: '0px 0px 0px 30px',
                height: '40px',
                width: '100%',
                fontSize: '14px',
                lineHeight: '22px',
              }}
              placeholder={intl.formatMessage(messages.search)}
            />
          </Box>
          {isCardanoHaskell(this.props.selectedNetwork) && (
            <div className={styles.minAda}>
              <MinAda minAda={calculateMinAda(selectedTokens)} />
            </div>
          )}

          {!shouldAddMore && (
            <Box marginTop="10px">
              <MaxAssetsError maxAssetsAllowed={10} />
            </Box>
          )}
          {currentNftsList.length === 0 ? (
            <div className={styles.noAssetFound}>
              <NoItemsFoundImg />
              <h1 className={styles.text}>
                {intl.formatMessage(
                  fullNftsList.length === 0 ? messages.noNFTsYet : messages.noNFTsFound
                )}
              </h1>
            </div>
          ) : (
            <>
              <div className={styles.nftsGrid}>
                {currentNftsList.map(nft => {
                  const isIncluded = this.isTokenIncluded(nft.info);
                  return (
                    <Box
                      component="button"
                      key={nft.info.Identifier}
                      className={styles.nftCard}
                      onClick={() => this.onSelect(nft.info)}
                      sx={{
                        padding: '16px',
                        cursor: 'pointer',
                        width: '180px',
                        minHeight: '237px',
                        overflow: 'hidden',
                        border: '2px solid',
                        borderColor: isIncluded ? 'primary.600' : 'gray.50',
                        borderRadius: '8px',
                        transition: 'border-color 300ms ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                      }}
                    >
                      <NFTImage
                        image={nft.image ?? null}
                        name={nft.name}
                        width="141px"
                        height="141px"
                      />
                      <Typography
                        variant="body1"
                        color="gray.900"
                        width="140px"
                        sx={{
                          wordWrap: 'break-word',
                          textAlign: 'center',
                          mt: '16px',
                        }}
                      >
                        {nft.name}
                      </Typography>
                    </Box>
                  );
                })}
              </div>
            </>
          )}
        </div>
        {fullNftsList.length !== 0 && (
          <Button
            sx={{
              width: '100%',
              color: 'secondary.300',
              borderTopLeftRadius: '0px',
              borderTopRightRadius: '0px',
              borderColor: 'gray.200',
              ':hover': {
                bgcolor: 'transparent',
                borderColor: 'gray.300',
              },
              '&.MuiButton-sizeMedium': {
                height: '81px',
              },
            }}
            disabled={selectedTokens.length === 0 || !shouldAddMore}
            onClick={this.onAddAll}
            variant="ternary"
          >
            {intl.formatMessage(globalMessages.confirm)}
          </Button>
        )}
      </Dialog>
    );
  }
}

// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import Select from '../../../common/Select';
import { MenuItem, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './UnitOfAccountSettings.scss';
import Dialog from '../../../widgets/Dialog';
import VerticalFlexContainer from '../../../layout/VerticalFlexContainer';
import LoadingSpinner from '../../../widgets/LoadingSpinner';
import globalMessages from '../../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  unitOfAccountTitle: {
    id: 'settings.unitOfAccount.title',
    defaultMessage: '!!!Fiat pairing',
  },
  note: {
    id: 'settings.unitOfAccount.note',
    defaultMessage:
      '!!!<strong>Note:</strong> coin price is approximate and may not match the price of any given trading platform. Any transactions based on these price approximates are done at your own risk.',
  },
  noteRevamp: {
    id: 'settings.revamp.unitOfAccount.note',
    defaultMessage:
      '!!!Please note, that the coin price is approximate and may not match the price of any given trading platform. Any transactions based on this price approximates are done at your own risk',
  },
  lastUpdated: {
    id: 'settings.unitOfAccount.lastUpdated',
    defaultMessage: '!!!<strong>Last updated:</strong> {lastUpdated}',
  },
  label: {
    id: 'settings.unitOfAccount.label',
    defaultMessage: '!!!Currency',
  },
  revampInputLabel: {
    id: 'settings.unitOfAccount.revamp.label',
    defaultMessage: '!!!Select currency',
  },
});

type Props = {|
  +onSelect: string => Promise<void>,
  +isSubmitting: boolean,
  +currencies: Array<{
    value: string,
    label: string,
    svg: string,
    name: string,
    ...
  }>,
  +currentValue: string,
  +error?: ?LocalizableError,
  +lastUpdatedTimestamp: ?number,
|};

@observer
export default class UnitOfAccountSettings extends Component<Props> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      coinPriceCurrencyId: {
        label: this.context.intl.formatMessage(messages.revampInputLabel),
      },
    },
  });

  render(): Node {
    const { currencies, error, currentValue, lastUpdatedTimestamp } = this.props;
    const { intl } = this.context;
    const { form } = this;
    const coinPriceCurrencyId = form.$('coinPriceCurrencyId');
    const componentClassNames = classNames([styles.component, 'currency']);

    const optionRenderer = option => {
      const SvgElem = option.svg;
      return (
        <MenuItem
          key={option.value}
          value={option.value}
          sx={{ height: '80px' }}
          id={'selectFiat-' + option.value + '-menuItem'}
        >
          <Box sx={{ display: 'flex' }}>
            <Box>
              <SvgElem className={styles.flag} width="38px" height="38px" />
            </Box>
            <Box sx={{ marginLeft: '8px' }}>
              <div>
                {/* $FlowFixMe[prop-missing] */}
                <strong>{option.value}</strong> - {option.name}
              </div>
              {/* $FlowFixMe[prop-missing] */}
              {option.native !== null ? (
                <Typography component="div" variant="body2" className={styles.optionSmallNative}>
                  native
                </Typography>
              ) : (
                <Typography component="div" variant="body2" color="var(--yoroi-widgets-hash-light)">
                  1 ADA =&nbsp;
                  {/* $FlowFixMe[prop-missing] */}
                  {option.price !== null ? option.price : '-'} {option.value}
                </Typography>
              )}
            </Box>
          </Box>
        </MenuItem>
      );
    };

    const lastUpdated =
      lastUpdatedTimestamp != null ? new Date(lastUpdatedTimestamp).toLocaleString() : '-';

    const dialog = this.props.isSubmitting ? (
      <Dialog
        title={intl.formatMessage(globalMessages.processingLabel)}
        closeOnOverlayClick={false}
      >
        <VerticalFlexContainer>
          <LoadingSpinner />
        </VerticalFlexContainer>
      </Dialog>
    ) : null;

    return (
      <Box
        sx={{
          b: '20px',
          mt: '13px',
          pt: false,
          borderTop: false,
          borderColor: false,
        }}
        className={componentClassNames}
      >
        {dialog}
        <Typography
          component="h2"
          variant="body1"
          fontWeight={500}
          mb="16px"
        >
          {intl.formatMessage(messages.unitOfAccountTitle)}
        </Typography>

        <Box
          sx={{
            width: '506px',
            marginTop: '0px',
          }}
        >
          <Select
            formControlProps={{ error: !!error }}
            helperText={error && intl.formatMessage(error, error.values)}
            error={!!error}
            {...coinPriceCurrencyId.bind()}
            onChange={this.props.onSelect}
            value={currentValue}
            menuProps={{
              sx: {
                '& .MuiMenu-paper': {
                  maxHeight: '280px',
                },
              },
            }}
            renderValue={value => (
              <Typography component="div"
                variant="body1"
                fontWeight="400"
              >
                {/* $FlowFixMe[prop-missing] */}
                {value} - {currencies.filter(item => item.value === value)[0].name}
              </Typography>
            )}
          >
            {currencies.map(option => optionRenderer(option))}
          </Select>

          {(
            <>
              <Typography component="div" variant="caption1" display="inline-block" color="grayscale.700" mt="4px">
                <FormattedHTMLMessage {...messages.noteRevamp} />
              </Typography>
              <Typography component="div"
                variant="body1"
                fontWeight={500}
                sx={{
                  '& span': { fontWeight: 400 },
                }}
                mt="16px"
                mb="35px"
              >
                <FormattedHTMLMessage {...messages.lastUpdated} values={{ lastUpdated }} />
              </Typography>
            </>
          )}
        </Box>
      </Box>
    );
  }
}

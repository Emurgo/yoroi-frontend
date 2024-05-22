// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import Select from '../../../common/Select';
import { Box, MenuItem, Typography } from '@mui/material';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './ExplorerSettings.scss';
import globalMessages from '../../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { ExplorerRow } from '../../../../api/ada/lib/storage/database/explorers/tables';
import { SelectedExplorer } from '../../../../domain/SelectedExplorer';
import { withLayout } from '../../../../styles/context/layout';
import type { InjectedLayoutProps } from '../../../../styles/context/layout';

type Props = {|
  +explorers: $ReadOnlyArray<$ReadOnly<ExplorerRow>>,
  +selectedExplorer: SelectedExplorer,
  +onSelectExplorer: ({|
    explorer: $ReadOnly<ExplorerRow>,
  |}) => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
|};

const messages = defineMessages({
  title: {
    id: 'wallet.settings.blockchain.explorer.title',
    defaultMessage: '!!!Explorer settings',
  },
});

@observer
class ExplorerSettings extends Component<Props & InjectedLayoutProps> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  selectExplorer: ($ReadOnly<ExplorerRow>) => Promise<void> = async explorer => {
    await this.props.onSelectExplorer({ explorer });
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      explorerId: {
        label: this.context.intl.formatMessage(globalMessages.blockchainExplorer),
        value: this.props.selectedExplorer.selected,
      },
    },
  });

  render(): Node {
    const { isSubmitting, error, isRevampLayout } = this.props;
    const { intl } = this.context;
    const { form } = this;
    const explorerId = form.$('explorerId');
    const componentClassNames = classNames([styles.component, 'explorer']);
    const options = this.props.explorers
      .map(explorer => ({
        value: explorer,
        label: explorer.Name,
      }))
      // if the explorer has no working pages, exclude it from the list
      .filter(explorer => Object.keys(explorer.value.Endpoints).length !== 0);

    return (
      <div className={componentClassNames}>
        {isRevampLayout && (
          <Typography component="div" variant="body1" fontWeight={500} mb="16px">
            {intl.formatMessage(messages.title)}
          </Typography>
        )}
        <Box sx={{ width: isRevampLayout ? '506px' : '100%' }}>
          <Select
            options={options}
            disabled={isSubmitting}
            labelId="explorer-select"
            {...explorerId.bind()}
            value={this.props.selectedExplorer.selected}
            onChange={this.selectExplorer}
          >
            {options.map(option => (
              <MenuItem key={option.value.ExplorerId} value={option.value} id={'selectExplorer-' + option.value.Name + '-menuItem'}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <div className={styles.error}>{intl.formatMessage(error, error.values)}</div>}
        </Box>
      </div>
    );
  }
}

export default (withLayout(ExplorerSettings): ComponentType<Props>);

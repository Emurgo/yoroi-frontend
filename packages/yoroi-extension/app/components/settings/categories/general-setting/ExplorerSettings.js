// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import Select from '../../../common/Select';
import { Box, Typography } from '@mui/material';
import { defineMessages, IntlContext } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './ExplorerSettings.scss';
import globalMessages from '../../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { ExplorerRow } from '../../../../api/ada/lib/storage/database/explorers/tables';
import { SelectedExplorer } from '../../../../domain/SelectedExplorer';
import { MenuItemStyled } from '../../../common/commonStyles/MenuItemStyled';

type Props = {|
  +explorers: $ReadOnlyArray<$ReadOnly<ExplorerRow>>,
  +selectedExplorer: SelectedExplorer,
  +onSelectExplorer: ({|
    explorerId: string,
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
export default class ExplorerSettings extends Component<Props> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextType = IntlContext;
  selectExplorer: (string) => Promise<void> = async explorerId => {
    await this.props.onSelectExplorer({ explorerId });
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      explorerId: {
        label: this.context.intl.formatMessage(globalMessages.blockchainExplorer),
        value: this.props.selectedExplorer.selected.ExplorerId,
      },
    },
  });

  render(): Node {
    const { isSubmitting, error } = this.props;
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
        <Typography component="div" variant="body1" fontWeight={500} mb="16px" color="ds.text_gray_medium">
          {intl.formatMessage(messages.title)}
        </Typography>
        <Box sx={{ width: '506px' }}>
          <Select
            disabled={isSubmitting}
            labelId="explorer-select"
            {...explorerId.bind()}
            value={this.props.selectedExplorer.selected.ExplorerId}
            onChange={this.selectExplorer}
            renderValue={() => (
              <Typography component="div" variant="body1" color="ds.text_gray_medium">
                {this.props.selectedExplorer.selected.Name}
              </Typography>
            )}
          >
            {options.map(option => (
              <MenuItemStyled
                key={option.value.ExplorerId}
                value={option.value.ExplorerId}
                id={'selectExplorer-' + option.value.Name + '-menuItem'}
              >
                {option.label}
              </MenuItemStyled>
            ))}
          </Select>
          {error && <div className={styles.error}>{intl.formatMessage(error, error.values)}</div>}
        </Box>
      </div>
    );
  }
}

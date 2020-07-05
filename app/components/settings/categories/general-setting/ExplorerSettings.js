// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Select } from 'react-polymorph/lib/components/Select';
import { SelectSkin } from 'react-polymorph/lib/skins/simple/SelectSkin';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './ExplorerSettings.scss';
import globalMessages from '../../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type {
  ExplorerRow,
} from '../../../../api/ada/lib/storage/database/explorers/tables';
import { SelectedExplorer  } from '../../../../domain/SelectedExplorer';

type Props = {|
  +explorers: $ReadOnlyArray<$ReadOnly<ExplorerRow>>,
  +selectedExplorer: SelectedExplorer,
  +onSelectExplorer: {|
    explorer: $ReadOnly<ExplorerRow>,
  |} => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
|};

@observer
export default class ExplorerSettings extends Component<Props> {
  static defaultProps: {|error: void|} = {
    error: undefined
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  selectExplorer: $ReadOnly<ExplorerRow> => Promise<void> = async (explorer) => {
    await this.props.onSelectExplorer({ explorer });
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      explorerId: {
        label: this.context.intl.formatMessage(globalMessages.blockchainExplorer),
        value: this.props.selectedExplorer.selected,
      }
    }
  });

  render(): Node {
    const { isSubmitting, error } = this.props;
    const { intl } = this.context;
    const { form } = this;
    const explorerId = form.$('explorerId');
    const componentClassNames = classNames([styles.component, 'explorer']);
    const explorerSelectClassNames = classNames([
      styles.explorer,
      isSubmitting ? styles.submitExplorerSpinner : null,
    ]);
    const options = this.props.explorers.map(explorer => ({
      value: explorer,
      label: explorer.Name,
    }));
    return (
      <div className={componentClassNames}>
        <Select
          className={explorerSelectClassNames}
          options={options}
          {...explorerId.bind()}
          value={this.props.selectedExplorer.selected}
          onChange={this.selectExplorer}
          skin={SelectSkin}
        />
        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}
      </div>
    );
  }

}

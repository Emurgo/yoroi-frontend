// @flow
import { Component } from 'react';
import type { Node } from 'react';
import TextField from '@mui/material/TextField';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import moment from 'moment';

const messages = defineMessages({
  startDate: {
    id: 'wallet.transaction.export.dialog.date.start.label',
    defaultMessage: '!!!Start Date',
  },
  endDate: {
    id: 'wallet.transaction.export.dialog.date.end.label',
    defaultMessage: '!!!End Date',
  },
  invalidInterval: {
    id: 'wallet.transaction.export.dialog.date.error.invalidInterval',
    defaultMessage: 'Invalid interval',
  },
});

type Props = {|
  date: {|
    startDate: Date | null,
    endDate: Date | null,
  |},
  setStartDate(Date | null): void,
  setEndDate(Date | null): void,
  initialId: string,
|};

@observer
export default class ExportTransactionDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { date, setStartDate, setEndDate, initialId } = this.props;

    const dates = [
      {
        id: 1,
        label: messages.startDate,
        value: date.startDate,
        setDateHandler: setStartDate,
        minDate: undefined,
        componentId: `${initialId}-startDate-datePicker`,
      },
      {
        id: 2,
        label: messages.endDate,
        value: date.endDate,
        setDateHandler: setEndDate,
        minDate: date.startDate !== null ? date.startDate : undefined,
        componentId: `${initialId}-endDate-datePicker`,
      },
    ];

    return (
      <LocalizationProvider dateAdapter={AdapterMoment}>
        {dates.map(({ id, label, value, setDateHandler, minDate, componentId }) => (
          <DatePicker
            key={id}
            label={intl.formatMessage(label)}
            value={value}
            maxDate={moment()} // Today
            minDate={minDate}
            onChange={setDateHandler}
            slotProps={{
              textField: {
                helperText: 'MM/DD/YYYY',
              },
            }}
            className={componentId}
            renderInput={params => {
              return <TextField {...params} sx={{ mb: '24px' }} />;
            }}
          />
        ))}
      </LocalizationProvider>
    );
  }
}

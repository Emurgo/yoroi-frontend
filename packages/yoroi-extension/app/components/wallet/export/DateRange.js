// @flow
import { Component } from 'react'
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { observer } from 'mobx-react';
import { Dayjs } from 'dayjs'
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

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
  date: {
    startDate: Dayjs | null,
    endDate: Dayjs | null,
  },
  setStartDate(Dayjs | null): void,
  setEndDate(Dayjs | null): void
|}

@observer
export default class ExportTransactionDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { date, setStartDate, setEndDate } = this.props;
    const invalidInterval = (
      date.startDate && date.endDate && date.startDate.isAfter(date.endDate)
    );
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label={intl.formatMessage(messages.startDate)}
          value={date.startDate}
          onChange={(newDate) => {
            setStartDate(newDate);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              error={invalidInterval}
              sx={{ mb: '10px' }}
            />
          )}
        />
        <DatePicker
          label={intl.formatMessage(messages.endDate)}
          value={date.endDate}
          onChange={(newDate) => {
            setEndDate(newDate);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              error={invalidInterval}
              helperText={invalidInterval ? 'Invalid interval' : ''}
              sx={{ mb: '10px' }}
            />
          )}
        />
      </LocalizationProvider>
    )
  }
}


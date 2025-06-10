// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';
import { observer } from 'mobx-react';
import { defineMessages, IntlContext } from 'react-intl';
import { ReactComponent as CalendarIcon } from '../../../assets/images/calendar-24.inline.svg';
import { styled, Box, TextField } from '@mui/material';

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

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignContent: 'center',
  justifyContent: 'center',
  alignItems: 'center',
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_max,
    },
  },
}));

const OpenPickerIcon = () => (
  <IconWrapper>
    <CalendarIcon />
  </IconWrapper>
);

@observer
export default class ExportTransactionDialog extends Component<Props> {
  static contextType:any = IntlContext;
  render(): Node {
    const intl = this.context;
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
            components={{
              OpenPickerIcon,
            }}
          />
        ))}
      </LocalizationProvider>
    );
  }
}

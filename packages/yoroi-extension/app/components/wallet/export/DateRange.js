// @flow
import { Component } from 'react'
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { observer } from 'mobx-react';

type Props = {|
    date: string, // todo: Add correct type
    setDate(): void
|}

@observer
export default class ExportTransactionDialog extends Component<Props> {
    render() {
        const { date, setStartDate, setEndDate } = this.props;
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start"
              value={date.startDate}
              onChange={(newValue) => {
                setStartDate(newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="End"
              value={date.setEndDate}
              onChange={(newValue) => {
                setEndDate(newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        )
    }
}


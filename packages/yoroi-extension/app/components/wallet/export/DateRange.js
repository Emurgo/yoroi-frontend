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
        const invalidInterval = (
          date.startDate && date.endDate && date.startDate.isAfter(date.endDate)
        );
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start"
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
              label="End"
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
            {/* <Typography sx={{ textAlign: 'center', mb: '20px', mt: '-12px', height: '22px' }} variant='subtitle2' color='error'>
              {invalidInterval && 'Invalid Interval'}
            </Typography> */}
          </LocalizationProvider>
        )
    }
}


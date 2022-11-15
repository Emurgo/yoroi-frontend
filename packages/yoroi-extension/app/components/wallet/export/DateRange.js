// @flow
import { Component } from 'react'
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { observer } from 'mobx-react';

type Props = {|
    date: string, // todo: Add correct type
    setDate(): void
|}

@observer
export default class ExportTransactionDialog extends Component<Props> {
    render() {
        const { date, setDate } = this.props;
        return (
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            localeText={{ start: 'Check-in', end: 'Check-out' }}
          >
            <DateRangePicker
              value={date}
              onChange={(newDate) => {
                setDate(newDate);
              }}
              renderInput={(startProps, endProps) => (
                <>
                  <TextField {...startProps} />
                  <Box sx={{ mx: 2 }}> to </Box>
                  <TextField {...endProps} />
                </>
              )}
            />
          </LocalizationProvider>
        )
    }
}


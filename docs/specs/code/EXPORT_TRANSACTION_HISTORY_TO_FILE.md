# Iteration 1 (basics)

## Abstract

Users want to export their transaction history into an Excel document.

Default format gotta be XLSX, but optionally we might also support CSV, cuz it's more universal and might be imported into Excel as well as lots of other programs.

## UI

I suggest adding a new "Export to File" icon at the top-right of the transactions list. Something like this (general idea):

![image](https://user-images.githubusercontent.com/5585355/50343034-8e94cc80-0536-11e9-9058-1af18be67f8a.png)

When user clicks "Export to file" - new dialog window opens up:

![image](https://user-images.githubusercontent.com/5585355/50401206-c6ea1400-079d-11e9-9980-2fb1c9cbc493.png)


Dialog contains:
1. Comment about the fact that the whole existing history will be exported
2. Dropdown-selector: "File format"
3. Button "Export"
4. Icon "Help" (Question mark)

Comments:
1. If we only gonna support XSLT for now - the dropdown selector for format might be either locked/disabled on the only default option, or replaced with just a label.

When user clicks the "Help" (question mark) icon - help dialog/tab is opened:

![image](https://user-images.githubusercontent.com/5585355/50401545-788a4480-07a0-11e9-931c-cd9c1a0e7a9c.png)

When export process starts - dialog probably gotta be locked with a spinner:

![image](https://user-images.githubusercontent.com/5585355/50346408-5647bb00-0543-11e9-9a63-684c0a5c8f17.png)

If no transaction are found in the selected period - dialog is displayed again but with an error message like: "Selected period contains no transactions".

## Technical

When user has selected the desired period and clicked "Export" - background function selects from local storage all existing transactions. Then a XLSX library used to generate a worksheet, and this worksheet then "stored in a file" according to the selected format. "Storing" the file should trigger the download request in the browser.

This library might be checked for example: https://libraries.io/npm/xlsx

## Exported file format

[Transaction_Export_Example.xlsx](https://github.com/Emurgo/yoroi-frontend/files/2700970/Transaction_Export_Example.xlsx)

![image](https://user-images.githubusercontent.com/5585355/50316566-42ab3e80-04c8-11e9-8f38-e45343472545.png)

We want to support this exact file format to be compatible with other services.

Columns:
1. **Type** - for now only `Deposit` or `Withdrawal`
2. **Buy Amount** - non-empty only for `Deposit`
3. **Buy Cur.** - non-empty only for `Deposit`, and for now only always `ADA`
4. **Sell Amount** - non-empty only for `Withdrawal`
5. **Sell Cur.** - non-empty only for `Withdrawal`, and for now only always `ADA`
6. **Fee Amount** - non-empty only for `Withdrawal` (because for deposit fee is not included)
7. **Fee Cur.** - non-empty only for `Withdrawal`, and for now only always `ADA`
8. **Exchange** - for now always empty (user might enter manually)
9. **Trade Group** - for now always empty
10. **Comment** - for now always empty
11. **Date** - transaction time

When file is produced - it should be named:
```
Yoroi-Transaction-History_YYYY-MM-DD.{xlsx, csv}
```

With **current date** inserted.

# Iteration 2 (export period)

## Abstract

Now users should be able to chose the time period to export transaction for, like day from and day to. There also might be a list of default periods, e.g.: "this month", "last 30 days", "this quarter", "this year", "all". Default period selected might be "this month".

## UI

Export dialog now contains additional elements to select a date-period:

![image](https://user-images.githubusercontent.com/5585355/50401307-9eaee500-079e-11e9-8972-a8162a3a5982.png)

Dialog contains:
1. Comment about the fact that the whole existing history will be exported
2. Dropdown-selector: "File format"
3. Dropdown-selector "Period"
4. Two date selectors: "from day", "to day"
5. Button "Export"
6. Icon "Help" (Question mark)

"Period" selector contains multiple **dynamic** values (meaning that selecting the same value
in different calendar days will select different specific period), like: "this month", "last month",
"this quarter", "last quarter", "this year", "last year", etc. While any of these **dynamic** values
are selected - "From" and "To" fields change their value accordingly, but they remain **disabled**
for manual input.

Additionally "Period" selector contains special value **"Custom"**. When use selects this option -
"From" and "To" selectors become enabled for manual input. 

## Technical

The difference now is when transactions are selected from the local storage - 
start and end dates are inserted as filters.

## File naming

When file is produced - it should be named:
```
Yoroi-Transaction-History_YYYY-MM-DD_to_YYYY-MM-DD.{xlsx, csv}
```

With period dates inserted.

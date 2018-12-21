## Abstract

Users want to export their transaction history into an Excel document.

Default format gotta be XLSX, but optionally we might also support CSV, cuz it's more universal and might be imported into Excel as well as lots of other programs.

Users should be able to chose the time period to export transaction for, like day from and day to. There also might be a list of default periods, e.g.: "this month", "last 30 days", "this quarter", "this year", "all". Default period selected might be "this month".

## UI

I suggest adding a new "Export to File" icon at the top-right of the transactions list. Something like this (general idea):

![image](https://user-images.githubusercontent.com/5585355/50343034-8e94cc80-0536-11e9-9058-1af18be67f8a.png)

When user clicks "Export to file" - new dialog window opens up:

![image](https://user-images.githubusercontent.com/5585355/50346357-31534800-0543-11e9-949a-873bcae9b854.png)

Dialog contains:
1. Two date selectors: "from day", "to day"
2. Dropdown-selector "Select period"
3. Dropdown-selector: "File format"
4. Button "Export"

Comments:
1. It might be an option for date-selectors to be locked/disabled by default, and only display the period selected in the dropdown, unless user selects option "Custom" - at which point selectors become enabled. But when user selects any other option - selectors become disabled again.
2. If we only gonna support XSLT for now - the dropdown selector for format might be either locked/disabled on the only default option, or replaced with just a label.

When export process starts - dialog probably gotta be locked with a spinner:

![image](https://user-images.githubusercontent.com/5585355/50346408-5647bb00-0543-11e9-9a63-684c0a5c8f17.png)

If no transaction are found in the selected period - dialog is displayed again but with an error message like: "Selected period contains no transactions".

## Technical

When user has selected the desired period and clicked "Export" - background function selects from local storage all transactions from the selected period. Then a XLSX library used to generate a worksheet, and this worksheet then "stored in a file" according to the selected format. "Storing" the file should trigger the download request in the browser.

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
Yoroi-Transaction-History_YYYY-MM-DD_to_YYYY-MM-DD.{xlsx, csv}
```

With period dates inserted.

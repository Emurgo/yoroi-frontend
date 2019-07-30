# Abstract

Describe the ability to see and input ADA amount in another currency.

# Proposal

This feature includes two aspects:

## 1. Input
When the UI contains an ADA amount input, it should let the user input the number in another currency and covert it to ADA amount at the present conversion rate.

## 2. Output
When the UI shows an ADA amount, additionally it should be able to show the amount in another currency at a relevant conversion rate.

# Risk

This feature does open new attack vector, for example: an attacker can engage a transaction with a victim and by hacking the backend and manipulate the conversion rate, trick the victim into transferring more Ada than the intended amount.

# Principles

This feature should be downgradable: in case the conversion rate is not available, the wallet should behave as if the feature is turned off and no function should be blocked (however the user can only see/input amounts in ADA).

# Frontend

## UI

This table lists places on the UI that need changes:

|Page|URI|Input/output|Fields|Component|File|Comments|
|----|---|------------|------|---------|----|--------|
|Transaction summary|/wallets/1/transactions|output|total balance|WalletTopbarTitle|/components/topbar/WalletTopbarTitle.js||
|||output|Outgoing pending confirmation|WalletSummary|/components/wallet/summary/WalletSummary.js||
|||output|transaction value & fee|Transaction|/components/wallet/transactions/Transaction.js|historical price|
|Send|/wallets/1/send|input|amount to send|WalletSendForm|/components/wallet/send/WalletSendForm.js||
|||output|fees & total|AmountInputSkin|/components/wallet/skins/AmountInputSkin.js|
|||output|fees, amount & total|WalletSendConfirmationDialog|/components/wallet/send/WalletSendConfirmationDialog.js||
|Transfer summary page|/transfer/daedalus /transfer/yoroi|output|recovered balance, fees, final balance|TransferSummaryPage|/components/transfer/TransferSummaryPage.js||
|Generate payment URL|/wallets/1/receive|input|amount|URIGenerateDialog|/components/uri/URIGenerateDialog.js||
|Payment URL landing|/send-from-uri|output|amount to send by uri|URIVerifyDialog|/components/uri/URIVerifyDialog.js||

In addition a new setting will be added under "General" category to let the user selects the currency.

## Implementation

A price storage will be added. On creation the store loads the user-selected currency from settings and periodically queries the backend for the conversion rate between ADA and this currency. The stores exposes two state variables:
1. A boolean variable indicating whether the current conversion rate is available.
2. A numeric variable for the conversion rate.

# Backend

The backend queries conversion rate data from multiple (at least 3) API providers and use the median value to answer client requests.

The backend will be hosted as an independent service to reduce attack vectors.

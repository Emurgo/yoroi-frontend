# Abstract

Describe the ability to see and input ADA amount in another currency.

# Proposal

This feature includes two aspects:

## 1. Input
When the UI contains an ADA amount input, it should let the user input the number in another currency and covert it to ADA amount at the present conversion rate.

## 2. Output
When the UI shows an ADA amount, additionally it should be able to show the amount in another currency. If the ADA amount is related to an existing transaction, the user will be able to see the price at two different moments:
-right now
-at the moment of the transaction.

The following fiat currencies will be supported:

- USD	US dollar	
- JPY	Japanese yen
- EUR   Euro
- CNY	Chinese yuan renminbi
- KRW	South Korean won

These are the currencies supported by https://exchangeratesapi.io/. See the Architecture section for details.

The following cryptos will be supported:
- BTC
- ETH

# Terminology

Frontend: yoroi-frontend.

Backend: yoroi-backend-service, partically the extensions that are required to implement this proposal.

API: third-party services that provide the price data.

Price data: the conversion rates between ADA and all supported currencies.

# Architecture

The frontend refreshes the current ADA price at 15 minute interval by querying the backend.

The backend refreshes the current ADA price at 15 minute interval by querying the API. So the freshness of the price data from the user's perspective is 15 minutes + 15 minutes = 30 minutes. The backend stores the timestamped price data in a historical price database.

At deployment time, a script will be run and it will query the API for historical price data, since the day when ADA began to be traded (Oct 2, 2017), and store the data in the historical price database.

When the frontend shows a transaction it will query the backend for the price at the moment of the transaction. The backend will look into the historical price database and use the price at the closest time point. The frontend will cache the price data in web storage.

To support the price conversions listed above, the backend queries crypto-price API for these pairs:

- ADA-USD
- BTC-USD
- ETH-USD

and https://exchangeratesapi.io/ for the exchange rate between USD and every fiat.

# Risk

This feature does open new attack vector, for example: an attacker can engage a transaction with a victim and by hacking the backend and manipulate the conversion rate, trick the victim into transferring more Ada than the intended amount.

To reduce the risk, the backend will be divided into two components: a service and a data-fetcher. The service:
1. Serves coin price queries from the frontend, using data out of its database.
2. Accepts price data updates from the data-fetcher.

The data-fetcher fetches price data from the API and notifies the service. The data-fetcher signs the data with a private key and the signatures are passed along the service to the frontend. Upon receiving price data, the frontend verifies the signatures with the corresponding public key. This scheme improve security because in case the service is comporised, because it doesn't have the private key used to sign data, the forgery will be detected by the frontend. In order to forge price data, an attack will have to comprise the data-fetcher, which is harder because the data-fetcher is not exposed to the network.


# Principles

This feature should be downgradable: in case the conversion rate is not available, the wallet should behave as if the feature is turned off and no function should be blocked (however the user can only see/input amounts in ADA).

# API


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
|Send confirmation dialog||output|fees, amount & total|WalletSendConfirmationDialog|/components/wallet/send/WalletSendConfirmationDialog.js||
|Hardware wallet send confirmation dialog||output||HWSendConfirmationDialog|app/components/wallet/send/HWSendConfirmationDialog.js||
|Transfer summary page|/transfer/daedalus /transfer/yoroi|output|recovered balance, fees, final balance|TransferSummaryPage|/components/transfer/TransferSummaryPage.js||
|Generate payment URL|/wallets/1/receive|input|amount|URIGenerateDialog|/components/uri/URIGenerateDialog.js||
|Payment URL landing|/send-from-uri|output|amount to send by uri|URIVerifyDialog|/components/uri/URIVerifyDialog.js||
|Transaction export|N/A|output||N/A|/api/export/index.js|historical|

In addition a new setting will be added under "General" category to let the user selects the currency.

## Implementation

In the profile store a new property will be added to record whether this feature is enabled and if yes, what is the selected currency (from the list of supported currencies in section Proposal). The property is backed by localStorage.

A price store will be added. On creation the store loads the user-selected currency from the profile store and periodically queries the backend for the conversion rate between ADA and this currency. The stores exposes two state variables:
1. A boolean variable indicating whether the current conversion rate is available.
2. A numeric variable for the conversion rate.

The TransactionsStore will be extended so that when it returns a list of transactions, it will also query the price data at the time points of the transactions, either from the web storage-backed cache, or from the backend.


# Backend

Then endpoints provided by the backend:

|Method|URL|Response|
|-|-|-|
|GET|/price/ADA/current|current price data|
|GET|/price/ADA/&lt;comma-seperated timestamps&gt;|price data at each timestamp|

The backend queries conversion rate data from multiple (at least 3) API providers and use the median value to answer client requests.

# APIs
To support the design of 15 minute refresh interval, the required query frequency is:
60 minutes/hour / 15 minutes * 24 hours/day = 96 /day
or maximal
96 /day * 31 day/month = 2976 /month.

Since we need to query the price of 3 cryptos, for APIs that only support one pair of rates per query, the numbers becomes:
288 /day or 8928 /month.

|API provider|Minimal plan|Price/month|Rate limit|Comments
|-|-|-|-|-|
|https://min-api.cryptocompare.com/pricing|Personal|Free|100,000 calls/month|Also used by Seiza. Terms: https://www.cryptocompare.com/free-api-use/|
|https://coinlayer.com/product|Basic|$9.99| 5,000 calls/month||
|https://coinmarketcap.com/api/pricing/|Basic|Free|10,000 calls/month||
|https://www.coinapi.io/Pricing|Startup|$79|1000 calls/day||
|https://p.nomics.com/pricing|Personal Use (Only)|Free|No rate limits||
|https://www.cryptonator.com/api/|N/A|Free|No rate limits||
|https://developers.shrimpy.io/#pricing|Data|Free|No rate limits||
|https://cryptoapis.io/products/market-data/#plans|Personal Use|Free|500 calls/day||

Coin gecko is buggy during the survey. Coinbase doesn't provide ADA price data. Bitcoinaverage and bitrex only provide crypto-crypto price data thus don't satisfy the needs.

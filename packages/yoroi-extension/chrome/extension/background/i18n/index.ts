// New definitions must be added to global-message.js.
// Translations must be manually added here.
const TRANSLATIONS = {
  'en-US': {
    "notification.button.wallet": "Go to the wallet page",
    "notification.button.stakingCenter": "Go to the staking center",
    "notification.button.swap": "Go to the swap page",
    "notification.button.cashback": "Go to the cashback dashboard",
    "notification.button.governance": "Go to the governance center"
  },
  'zh-Hans': {
    "notification.button.wallet": "前往钱包页面",
    "notification.button.stakingCenter": "前往质押页面",
    "notification.button.swap": "前往资产交换页面",
    "notification.button.cashback": "前往现金返还奖励页面",
    "notification.button.governance": "前往链上治理页面"
  },
}

function assertType<T>(_: T): void {}

assertType<Record<string, (typeof TRANSLATIONS)['en-US']>>(TRANSLATIONS);

export default TRANSLATIONS;

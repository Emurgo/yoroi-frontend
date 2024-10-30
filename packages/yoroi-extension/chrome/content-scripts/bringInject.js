// @flow

/*::
declare var chrome;
*/

import { bringInitContentScript } from "@bringweb3/chrome-extension-kit";

const darkTheme = {
  // font
  fontUrl: 'https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap',
  fontFamily: '"Rubik", sans-serif',
  // Popup
  popupBg: "#15171F",
  popupShadow: "0px 6px 20px 0px rgba(0, 0, 0, 0.10), 0px 1px 8px 0px rgba(0, 0, 0, 0.06)",
  // Primary button
  primaryBtnBg: "#4B6DDE",
  primaryBtnFS: "16px",
  primaryBtnFW: "500",
  primaryBtnFC: "#FFFFFF",
  primaryBtnBorderC: "transparent",
  primaryBtnBorderW: "0",
  primaryBtnRadius: "8px",
  // Secondary button
  secondaryBtnBg: "#15171F",
  secondaryBtnFS: "14px",
  secondaryBtnFW: "500",
  secondaryBtnFC: "#7892E8",
  secondaryBtnBorderC: "#7892E8",
  secondaryBtnBorderW: "2px",
  secondaryBtnRadius: "8px",
  // Markdown
  markdownBg: "#15171F",
  markdownFS: "14px",
  markdownFC: "#E1E6F5",
  markdownBorderW: "1px",
  markdownRadius: "8px",
  markdownBorderC: "#262A38",
  markdownScrollbarC: "#4B5266",
  // Wallet address
  walletBg: "#1F232E",
  walletFS: "12px",
  walletFW: "400",
  walletFC: "#E1E6F5",
  walletBorderC: "transparent",
  walletBorderW: "0",
  walletRadius: "80px",
  // Details of offering
  detailsBg: "#15171F",
  detailsTitleFS: "16px",
  detailsTitleFW: "500",
  detailsTitleFC: "#E1E6F5",
  detailsSubtitleFS: "16px",
  detailsSubtitleFW: "400",
  detailsSubtitleFC: "#E1E6F5",
  detailsRadius: "8px",
  detailsBorderW: "1px",
  detailsBorderC: "#262A38",
  detailsAmountFC: "#7892E8",
  detailsAmountFW: "500",
  // Overlay
  overlayBg: "#1F232ECC",
  overlayFS: "16px",
  overlayFW: "400",
  overlayFC: "#E1E6F5",
  loaderBg: "#4B6DDE",
  // Optout \ Turn off
  optoutBg: "#15171F",
  optoutFS: "16px",
  optoutFW: "400",
  optoutFC: "#E1E6F5",
  optoutRadius: "4px",
  // X Button and close buttons
  closeFS: "12px",
  closeFW: "400",
  closeFC: "#E1E6F5",
  // Token name
  tokenBg: "#1F253B",
  tokenFS: "14px",
  tokenFW: "500",
  tokenFC: "#7892E8",
  tokenBorderW: "0",
  tokenBorderC: "transparent",
  tokenRadius: "80px",
  // Notification popup
  notificationFS: "16px",
  notificationFW: "400",
  notificationFC: "#E1E6F5",
  notificationBtnBg: "#15171F",
  notificationBtnFS: "14px",
  notificationBtnFW: "500",
  notificationBtnFC: "#7892E8",
  notificationBtnBorderW: "2px",
  notificationBtnBorderC: "#7892E8",
  notificationBtnRadius: "8px",
  // Activate title
  activateTitleFS: "16px",
  activateTitleFW: "400",
  activateTitleFC: "#E1E6F5",
  activateTitleBoldFS: "16px",
  activateTitleBoldFW: "500",
  activateTitleBoldFC: "#E1E6F5",
}

const lightTheme = {

  // Popup
  popupBg: "#FFFFFF",
  popupShadow: "0px 6px 20px 0px rgba(0, 0, 0, 0.10), 0px 1px 8px 0px rgba(0, 0, 0, 0.06)",
  // Primary button
  primaryBtnBg: "#4B6DDE",
  primaryBtnFC: "#FFFFFF",
  primaryBtnFW: "500",
  primaryBtnFS: "16px",
  primaryBtnBorderC: "transparent",
  primaryBtnBorderW: "0",
  primaryBtnRadius: "8px",
  // Secondary button
  secondaryBtnBg: "#FFFFFF",
  secondaryBtnFS: "14px",
  secondaryBtnFW: "500",
  secondaryBtnFC: "#4B6DDE",
  secondaryBtnBorderC: "#4B6DDE",
  secondaryBtnBorderW: "2px",
  secondaryBtnRadius: "8px",
  // Markdown
  markdownBg: "#FFFFFF",
  markdownFS: "14px",
  markdownFC: "#242838",
  markdownBorderW: "1px",
  markdownRadius: "8px",
  markdownBorderC: "#DCE0E9",
  markdownScrollbarC: "#A7AFC0",
  // Wallet address
  walletBg: "#EAEDF2",
  walletFS: "12px",
  walletFW: "400",
  walletFC: "#242838",
  walletBorderC: "transparent",
  walletBorderW: "0",
  walletRadius: "80px",
  // Details of offering
  detailsBg: "#FFFFFF",
  detailsTitleFS: "16px",
  detailsTitleFW: "500",
  detailsTitleFC: "#242838",
  detailsSubtitleFS: "16px",
  detailsSubtitleFW: "400",
  detailsSubtitleFC: "#242838",
  detailsRadius: "8px",
  detailsBorderW: "1px",
  detailsBorderC: "#DCE0E9",
  detailsAmountFC: "#4B6DDE",
  detailsAmountFW: "500",
  // Overlay
  overlayBg: "#0000007A",
  overlayFS: "16px",
  overlayFW: "400",
  overlayFC: "#242838",
  loaderBg: "#4B6DDE",
  // Optout \ Turn off
  optoutBg: "#FFFFFF",
  optoutFS: "16px",
  optoutFW: "400",
  optoutFC: "#242838",
  optoutRadius: "4px",
  // X Button and close buttons
  closeFS: "12px",
  closeFW: "400",
  closeFC: "#242838",
  // Token name
  tokenBg: "#E4E8F7",
  tokenFS: "14px",
  tokenFW: "500",
  tokenFC: "#4B6DDE",
  tokenBorderW: "0",
  tokenBorderC: "transparent",
  tokenRadius: "80px",
  // Notification popup
  notificationFS: "16px",
  notificationFW: "400",
  notificationFC: "#242838",
  notificationBtnBg: "#FFFFFF",
  notificationBtnFS: "14px",
  notificationBtnFW: "500",
  notificationBtnFC: "#4B6DDE",
  notificationBtnBorderW: "2px",
  notificationBtnBorderC: "#4B6DDE",
  notificationBtnRadius: "8px",
  // Activate title
  activateTitleFS: "16px",
  activateTitleFW: "400",
  activateTitleFC: "#242838",
  activateTitleBoldFS: "16px",
  activateTitleBoldFW: "500",
  activateTitleBoldFC: "#242838",
}


function getFromBackground(functionName: string, params: any): Promise<any> {
  const uid = Math.random();
  return new Promise((resolve, reject) => {
    chrome.runtime.onMessage.addListener((msg, sender) => {
      if (msg.type === 'connector_rpc_response' && msg.uid === uid) {
        if (msg.return.ok) {
          resolve(msg.return.ok);
        } else {
          reject(new Error(msg.return.err));
        }
      }
    });

    window.postMessage({
      type: "connector_rpc_request",
      url: location.hostname,
      uid,
      function: functionName,
      params,
      returnType: 'json',
    });
  });
}

async function getFirstAddress(): Promise<string | typeof undefined> {
  try {
    const usedAddresses = await getFromBackground('get_used_addresses', [undefined]);
    if (usedAddresses.length > 0) {
      return usedAddresses[0];
    }
    const unusedAddresses = await getFromBackground('get_unused_addresses', [undefined]);
    return unusedAddresses[0];
  } catch (error) {
    return undefined
  }
}

function getTheme(): Promise<'light' | 'dark'> {
  return getFromBackground('get-theme-mode', [undefined]);
}

function popUpWalletCreation(): void {
  getFromBackground('pop-up-wallet-creation');
}

function listenForActiveWalletOpen(callback) {
  // todo: verify sender extension id
  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === 'active-wallet-open') {
      callback();
    }
  });
}

(async () => {
  await bringInitContentScript({
    getWalletAddress: getFirstAddress,
    promptLogin: popUpWalletCreation,
    walletAddressUpdateCallback: listenForActiveWalletOpen,
    theme: await getTheme(),
    lightTheme,
    darkTheme,
    text: 'upper'
  });
})().catch(console.error);

// @flow

import { bringInitContentScript } from "@bringweb3/chrome-extension-kit";

(async () => {
  await bringInitContentScript({
    iframeEndpoint: process.env.IFRAME_ENDPOINT,
    getWalletAddress: async () => await new Promise(resolve => setTimeout(() => resolve('<USER_WALLET_ADDRESS>'), 200)),// Async function that returns the current user's wallet address
    promptLogin: () => { return window.prompt('login'); }, // Function that prompts a UI element asking the user to login
    walletAddressListeners: ["customEvent:addressChanged"], // A list of custom events that dispatched when the user's wallet address had changed
    customTheme: {
      // font
      fontUrl: 'https://fonts.googleapis.com/css2?family=Matemasie&display=swap',
      fontFamily: "'Matemasie', system-ui",
      // Popup
      popupBg: "#192E34",
      popupShadow: "",
      // Primary button
      primaryBtnBg: "linear-gradient(135deg, #5DEB5A 0%, #FDFC47 100%)",
      primaryBtnFC: "#041417",
      primaryBtnFW: "600",
      primaryBtnFS: "14px",
      primaryBtnBorderC: "transparent",
      primaryBtnBorderW: "0",
      primaryBtnRadius: "8px",
      // Secondary button
      secondaryBtnBg: "transparent",
      secondaryBtnFS: "12px",
      secondaryBtnFW: "500",
      secondaryBtnFC: "white",
      secondaryBtnBorderC: "rgba(149, 176, 178, 0.50)",
      secondaryBtnBorderW: "2px",
      secondaryBtnRadius: "8px",
      // Markdown
      markdownBg: "#07131766",
      markdownFS: "12px",
      markdownFC: "#DADCE5",
      markdownBorderW: "0",
      markdownRadius: "4px",
      markdownBorderC: "black",
      markdownScrollbarC: "#DADCE5",
      // Wallet address
      walletBg: "#33535B",
      walletFS: "10px",
      walletFW: "400",
      walletFC: "white",
      walletBorderC: "white",
      walletBorderW: "0",
      walletRadius: "4px",
      // Details of offering
      detailsBg: "#33535B",
      detailsTitleFS: "15px",
      detailsTitleFW: "600",
      detailsTitleFC: "white",
      detailsSubtitleFS: "14px",
      detailsSubtitleFW: "500",
      detailsSubtitleFC: "#A8ADBF",
      detailsRadius: "8px",
      detailsBorderW: "0",
      detailsBorderC: "transparent",
      detailsAmountFC: "#5DEB5A",
      detailsAmountFW: "700",
      // Overlay
      overlayBg: "#192E34E6",
      overlayFS: "13px",
      overlayFW: "400",
      overlayFC: "#DADCE5",
      loaderBg: "#0A2EC0",
      // Optout \ Turn off
      optoutBg: "#192E34",
      optoutFS: "14px",
      optoutFW: "400",
      optoutFC: "white",
      optoutRadius: "56px",
      // X Button and close buttons
      closeFS: "9px",
      closeFW: "300",
      closeFC: "#B9BBBF",
      // Token name
      tokenBg: "transparent",
      tokenFS: "13px",
      tokenFW: "600",
      tokenFC: "#DADCE5",
      tokenBorderW: "2px",
      tokenBorderC: "#DADCE5",
      // Notification popup
      notificationFS: "14px",
      notificationFW: "500",
      notificationFC: "white",
      notificationBtnBg: "linear-gradient(135deg, #5DEB5A 0%, #FDFC47 100%)",
      notificationBtnFS: "12px",
      notificationBtnFW: "500",
      notificationBtnFC: "#041417",
      notificationBtnBorderW: "0",
      notificationBtnBorderC: "transparent",
      notificationBtnRadius: "8px",
      activateTitleFS: "--activate-title-f-s",
      activateTitleFW: "--activate-title-f-w",
      activateTitleFC: "--activate-title-f-c",
      activateTitleBoldFS: "--activate-title-bold-f-s",
      activateTitleBoldFW: "--activate-title-bold-f-w",
      activateTitleBoldFC: "--activate-title-bold-f-c",
    }
  });
})().catch(console.error);

function getFromBackground(functionName: string, params: andy): Promise<any> {
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
      returnType: 'cbor',
    });
  });
}

async function getFirstAddress(): Promise<string> {
  const usedAddresses = await getFromBackground('get_used_addresses', [undefined]);
  if (usedAddresses.length > 0) {
    return usedAddresses[0];
  }
  const unusedAddresses = await getFromBackground('get_unused_addresses', [undefined]);
  return unusedAddresses[0];
}

function getTheme(): Promise<'light' | 'dark'> {
  return getFromBackground('get-theme-mode', [undefined]);
}

function listenForActiveWalletOpen(callback) {
  // todo: verify sender extension id
  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === 'active-wallet-open') {
      callback(msg.activeWalletId);
    }
  });
}

async function example() {
  try {
    const addr = await getFirstAddress();
    console.log('address', addr);
  } catch (error) {
    if (error.message === 'no wallet') {
      console.log('no wallet');
    } else {
      throw error;
    }
  }

  const theme = await getTheme();
  console.log('theme:', theme);

  listenForActiveWalletOpen((walletId: ?number) => {
    console.log('active wallet ID is:', walletId);
  });
}

example().catch(console.error);

// @flow

export const getCurrentAppRoute = async function () {
  const url = (await this.driver.getCurrentUrl());
  return url.substring(url.indexOf('#/') + 1); // return without the hash
};

export const waitUntilUrlEquals = function (expectedUrl: string) {
  const context = this;
  return context.driver.wait(async () => {
    const url = await getCurrentAppRoute.call(context);
    return url === expectedUrl;
  });
};

export const navigateTo = function (requestedRoute: string) {
  return this.driver.executeScript((route) => {
    window.yoroi.actions.router.goToRoute.trigger({ route });
  }, requestedRoute);
};

/** This will reture true for:
  * Wallet/Transaction page
  * Wallet/Send page
  * Wallet/Setting page */
export const isAnyWalletsRoute = async function () {
  return (await getCurrentAppRoute.call(this)).startsWith('/wallets');
};

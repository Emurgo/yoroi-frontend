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

export const getExtensionId = function (): Promise<string> {
  const context = this;
  return context.driver.wait(async () => {
    const pageUrl = await context.driver.getCurrentUrl();
    const extIdRegex = new RegExp('extension://([-a-z0-9]+)/main_window');
    const matchExtId = extIdRegex.exec(pageUrl);
    if (matchExtId && matchExtId[1]) return matchExtId[1];
    return null;
  });
};

export const getCurrentAppRoute = async function () {
  const url = (await this.driver.getCurrentUrl());
  return url.substring(url.indexOf('#/') + 1); // return without the hash
};

export const waitUntilUrlEquals = function (expectedUrl) {
  const context = this;
  return context.driver.wait(async () => {
    const url = await getCurrentAppRoute.call(context);
    return url === expectedUrl;
  });
};

export const navigateTo = function (requestedRoute) {
  return this.driver.executeScript((route) => {
    window.yoroi.actions.router.goToRoute.trigger({ route });
  }, requestedRoute);
};

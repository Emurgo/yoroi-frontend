// @flow

// TODO: delete this file

/** Follow heuristic to pick which address to send Daedalus transfer to */
export async function getReceiverAddress(): Promise<string> {
  // Note: Current heuristic is to pick the first address in the wallet
  // rationale & better heuristic described at https://github.com/Emurgo/yoroi-frontend/issues/96
  const addresses = await getAdaAddressesByType('External');
  return addresses[0].cadId;
}

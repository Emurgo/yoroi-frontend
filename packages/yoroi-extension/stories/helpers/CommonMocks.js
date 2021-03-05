// @flow

let conceptualWalletCounter = 0;
let publicDeriverCounter = 0;

export function getNextConceptualWalletCounter(): number {
  return conceptualWalletCounter++;
}
export function getNextPublicDeriverCounter(): number {
  return publicDeriverCounter++;
}

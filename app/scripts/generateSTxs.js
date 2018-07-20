// @flow

import { mapToList } from '../api/ada/lib/utils';
import { getWalletSeed } from '../api/ada/adaWallet';
import { getCryptoWalletFromSeed } from '../api/ada/lib/cardanoCrypto/cryptoWallet';
import { newAdaAddress, getAdaAddressesMap, saveAdaAddress, removeAdaAddress } from '../api/ada/adaAddress';
import { getSingleCryptoAccount } from '../api/ada/adaAccount';
import { getAdaTransactionFromSenders, newAdaTransaction } from '../api/ada/adaTransactions/adaNewTransactions';

const CONFIRMATION_TIME = 40 * 1000; // 40 seconds
const AMOUNT_SENT = '180000';        // 0.18 ada. This amount should be bigger than
                                     //           the fee of the txs (In general ≃0.17)
const AMOUNT_TO_BE_SENT = '1';       // 0.000001 ada. Amount transfered on the generated stxs.

/**
 * Generates 'numberOfTxs' signed txs. The generated txs can be executed in any order,
 * given that the loaded wallet is not used after the stxs have been generated.
 *
 * @param {*} password of the loaded address
 * @param {*} numberOfTxs to be generated
 * @param {*} debugging, whether the function should be executed in debugging mode
 * @requires being called in a context where the Rust module has been loaded
 * @requires being called in a context where a wallet has been stored on local storage,
 *           with it having 'numberOfTxs * 0.36' ada.
 */
export async function generateSTxs(password: string,
                                   numberOfTxs: number,
                                   debugging: boolean = false) {
  const log = _logIfDebugging(debugging);
  const cryptoAccount = getSingleCryptoAccount();

  log('[generateSTxs] Starting generating stxs');

  const adaAddresses = [];
  for (let i = 0; i < numberOfTxs; i++) {
    const newAddress = await _generateNewAddress(cryptoAccount);
    adaAddresses.push(newAddress);
    log(`[generateSTxs] Generated the address ${newAddress.cadId}`);
  }
  log('[generateSTxs] Generated addresses');

  // Delete addresses so that their funds are not used for any of the txs sent
  _removeAdaAddresses(cryptoAccount, adaAddresses);

  for (let i = 0; i < numberOfTxs; i++) {
    const newWalletAddr = adaAddresses[i].cadId;
    await newAdaTransaction(newWalletAddr, AMOUNT_SENT, password);
    log(`[generateSTxs] Giving funds to ${newWalletAddr}`);

    // Wait fot the tx to be confirmed so that its inputs are not used by the next txs
    // FIXME: Improve querying the explorer or using the tx history
    await new Promise(resolve => setTimeout(resolve, CONFIRMATION_TIME));
    log('[generateSTxs] Tx that provided funds was confirmed');
  }

  _saveAdaAddresses(cryptoAccount, adaAddresses);

  log('[generateSTxs] Starting generating stxs');
  const newAddress = (await _generateNewAddress(cryptoAccount)).cadId;
  const seed = getWalletSeed();
  const cryptoWallet = getCryptoWalletFromSeed(seed, password);
  for (let i = 0; i < numberOfTxs; i++) {
    const sender = adaAddresses[i];
    const createSTxResult = await getAdaTransactionFromSenders(
      [sender],
      newAddress,
      AMOUNT_TO_BE_SENT,
      cryptoWallet
    );
    const cborEncodedStx = createSTxResult[0].cbor_encoded_tx;
    const bs64STx = Buffer.from(cborEncodedStx).toString('base64');

    if (!debugging) {
      console.log(`${bs64STx}`);
    }
    log(`[generateSTxs] Generated stx ${bs64STx} from ${sender.cadId} to ${newAddress}`);
  }

  log(`[generateSTxs] Generated ${numberOfTxs} stxs`);
}


function _logIfDebugging(debugging) {
  function printMsg(msg) {
    if (debugging) {
      console.log(msg);
    }
  }
  return printMsg;
}

function _generateNewAddress(cryptoAccount) {
  const addresses = mapToList(getAdaAddressesMap());
  return newAdaAddress(cryptoAccount, addresses, 'External');
}

async function _removeAdaAddresses(cryptoAccount, addresses) {
  for (const addr of addresses) {
    await removeAdaAddress(addr);
  }
}

// The same index from the AdaAddresses is used when saving them
function _saveAdaAddresses(cryptoAccount, adaAddresses) {
  adaAddresses.forEach((adaAddress) => saveAdaAddress(adaAddress, 'External'));
}

import type { IGetSigningKey, IGetStakingKey, IPublicDeriver } from './lib/storage/models/PublicDeriver/interfaces';
import { ConceptualWallet } from './lib/storage/models/ConceptualWallet';
import type { IHasLevels } from './lib/storage/models/ConceptualWallet/interfaces';
import { RustModule } from './lib/cardanoCrypto/rustLoader';
import { derivePrivateByAddressing } from './lib/cardanoCrypto/deriveByAddressing';
import { Logger, stringifyError } from '../../utils/logging';
import { WrongPassphraseError } from './lib/cardanoCrypto/cryptoErrors';
import { GenericApiError, IncorrectWalletPasswordError } from '../common/errors';
import LocalizableError from '../../i18n/LocalizableError';

export async function genOwnStakingKey(request: {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IGetSigningKey & IGetStakingKey,
  password: string,
|}): Promise<RustModule.WalletV4.PrivateKey> {
  try {
    const signingKeyFromStorage = await request.publicDeriver.getSigningKey();
    const stakingAddr = await request.publicDeriver.getStakingKey();
    const normalizedKey = await request.publicDeriver.normalizeKey({
      ...signingKeyFromStorage,
      password: request.password,
    });
    const normalizedSigningKey = RustModule.WalletV4.Bip32PrivateKey.from_hex(normalizedKey.prvKeyHex);
    const normalizedStakingKey = derivePrivateByAddressing({
      addressing: stakingAddr.addressing,
      startingFrom: {
        key: normalizedSigningKey,
        level: request.publicDeriver.getParent().getPublicDeriverLevel(),
      },
    }).to_raw_key();

    return normalizedStakingKey;
  } catch (error) {
    Logger.error(`${nameof(genOwnStakingKey)} error: ` + stringifyError(error));
    if (error instanceof WrongPassphraseError) {
      throw new IncorrectWalletPasswordError();
    }
    if (error instanceof LocalizableError) throw error;
    throw new GenericApiError();
  }
}
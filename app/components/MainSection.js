import React from 'react';
import CardanoCrypto from 'rust-cardano-crypto';
import { Buffer } from 'safe-buffer';
import {
    generateMnemonicImpl
  , mnemonicToSeedImpl
} from '../crypto/BIP39';
import Footer from './Footer';


const MainSection = () => {
  // TODO: Remove it!
  const testWords = generateMnemonicImpl();
  const testSeed = mnemonicToSeedImpl(testWords);
  const wallet = CardanoCrypto.HdWallet.fromSeed(testSeed);
  const pk = CardanoCrypto.HdWallet.toPublic(wallet);
  const pkHex = Buffer.from(pk).toString('hex');

  return (
    <section>
      <p>
        12 Words:
        <br />
        {testWords}
        <br />
        Public key:
        <br />
        {pkHex}
      </p>
      <Footer />
    </section>
  );
};

export default MainSection;

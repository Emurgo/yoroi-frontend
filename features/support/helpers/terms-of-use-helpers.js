const TERMS_OF_USE_FORM = '.TermsOfUseForm_component';

const termsOfUse = {
  waitForVisible: async (client, { isHidden } = {}) => (
    client.waitForVisible(TERMS_OF_USE_FORM, null, isHidden)
  ),
};

export default termsOfUse;

const path = require('path');
const fs = require('fs');

export const getMockedFileBuffer = (filename) => {
  // TODO: review this method
  const PDFPath = path.resolve('./tests/unit/test/mockData/' + filename);
  return fs.readFileSync(PDFPath);
};

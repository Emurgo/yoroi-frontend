const path = require('path');
const fs = require('fs');

export const getMockedFileBuffer = (filename) => {
  const PDFPath = path.resolve('./tests/unit/mockData/' + filename);
  return fs.readFileSync(PDFPath);
};

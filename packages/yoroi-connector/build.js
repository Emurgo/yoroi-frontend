const rimraf = require("rimraf");
const fse = require('fs-extra');
const genManifest = require('./manifest/manifest.template.js');
const package = require('./package.json');
const argv = require('minimist')(process.argv.slice(2));

rimraf.sync("./build");
fse.mkdirSync("./build");
fse.mkdirSync("./build/img");

const extensionId = argv.yoroiExtensionId;
const extensionIdHeader = `var extensionId = "${extensionId}";\r\n`;

/// need to both copy the src file and expose the extension ID to it
function copyFileSrc(name) {
  const file = `./src/${name}`;
  const data = fse.readFileSync(`./src/${name}`); //read existing contents into data
  const fd = fse.openSync(`./build/${name}`, 'w+');

  // expose extension ID for build
  fse.writeSync(fd, extensionIdHeader, 0, extensionIdHeader.length, 0);
  // add content for file
  fse.writeSync(fd, data, 0, data.length, extensionIdHeader.length);
  fse.close(fd);
}

fse.readdirSync('./src').forEach(file => copyFileSrc(file));

const isNightly = extensionId === 'poonlenmfdfbjfeeballhiibknlknepo';

const icons = isNightly
  ? {
    '16': 'img/nightly-16.png',
    '48': 'img/nightly-48.png',
    '128': 'img/nightly-128.png',
  }
  : {
    '16': 'img/icon-16.png',
    '48': 'img/icon-48.png',
    '128': 'img/icon-128.png',
  };
Object.values(icons).forEach(path => fse.copyFileSync(`./${path}`, `./build/${path}`));

const manifest = genManifest({
  displayName: isNightly
    ? 'Yoroi dApp Connector Nightly'
    : 'Yoroi dApp Connector',
  version: package.version,
  icons: isNightly
    ? {
      '16': 'img/nightly-16.png',
      '48': 'img/nightly-48.png',
      '128': 'img/nightly-128.png',
    }
    : {
      '16': 'img/icon-16.png',
      '48': 'img/icon-48.png',
      '128': 'img/icon-128.png',
    },
});
fse.writeFileSync('./build/manifest.json', JSON.stringify(manifest, null, 2));
